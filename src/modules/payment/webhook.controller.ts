import { Request, Response } from "express";

import config from "../../config";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe_webhook_secret!,
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Only log if it's the event we care about
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    // Safety Check: Ensure metadata exists
    if (session.metadata?.requestId) {
      // console.log("Processing Payment for Request ID:", session.metadata.requestId);

      const requestId = session.metadata.requestId;

      const existing = await prisma.payment.findUnique({
        where: { requestId },
      });

      if (existing) {
        return res.json({ received: true }); // already proceid, tell to stripe we're done
      }
      await prisma.$transaction([
        prisma.payment.create({
          data: {
            requestId,
            amount: session.amount_total / 100,
            paymentStatus: "PAID",
            transactionId: session.payment_intent as string,
            paymentMethod: "STRIPE",
            paidAt: new Date(),
          },
        }),
        prisma.rentalRequest.update({
          where: { id: requestId },
          data: { status: "ACTIVE" },
        }),
      ]);
    } else {
      console.error("Payment succeeded but no requestId found in metadata!");
    }
  }
   return res.json({ received: true });
};
