import { Request, Response } from "express";

import config from "../../config";
import { stripe } from "../../lib/stripe";
import { fulfillPaidCheckout } from "./payment.fulfill";

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

    try {
      await fulfillPaidCheckout({
        requestId,
        amountTotal: session.amount_total,
        paymentIntent: session.payment_intent as string | null,
        sessionId: session.id,
      });
    } catch (error) {
      console.error("Failed to fulfill checkout from webhook:", error);
      return res.status(500).json({ received: false });
    }
  }

  return res.json({ received: true });
};
