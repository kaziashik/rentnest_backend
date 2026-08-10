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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const requestId = session.metadata?.requestId as string | undefined;

    if (!requestId) {
      console.error("Payment succeeded but no requestId found in metadata!");
      return res.json({ received: true });
    }

    const existing = await prisma.payment.findUnique({
      where: { requestId },
    });

    if (existing) {
      return res.json({ received: true });
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      select: { id: true, propertyId: true },
    });

    if (!rentalRequest) {
      console.error(`Payment succeeded but rental request ${requestId} was not found`);
      return res.json({ received: true });
    }

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          requestId,
          amount: (session.amount_total ?? 0) / 100,
          paymentStatus: "PAID",
          transactionId: (session.payment_intent as string) || `stripe_${session.id}`,
          paymentMethod: "STRIPE",
          paidAt: new Date(),
        },
      }),
      // Tenant rental becomes Active after successful payment
      prisma.rentalRequest.update({
        where: { id: requestId },
        data: { status: "ACTIVE" },
      }),
      // Listing leaves the market once rent is paid
      prisma.property.update({
        where: { id: rentalRequest.propertyId },
        data: { availability: "UNAVAILABLE" },
      }),
    ]);
  }

  return res.json({ received: true });
};
