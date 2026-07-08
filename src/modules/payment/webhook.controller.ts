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
      config.stripe_webhook_secret!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    // Create the payment record in your database
    await prisma.payment.create({
      data: {
        requestId: session.metadata.requestId,
        amount: session.amount_total / 100, // Stripe uses cents
         paymentStatus: "PAID",
        transactionId: session.payment_intent,
        paymentMethod: "card",
        paidAt: new Date(),
      },
    });
    
    // Optional: Update your RentalRequest status to "PAID"
    await prisma.rentalRequest.update({
      where: { id: session.metadata.requestId },
      data: { status: "ACTIVE" } 
    });
  }

  res.json({ received: true });
};