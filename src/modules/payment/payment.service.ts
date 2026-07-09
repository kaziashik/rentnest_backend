import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";

const createCheckoutSession = async (requestId: string) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { property: true },
  });

  // Allow payment only after landlord approval
  if (rentalRequest.status !== "APPROVED") {
    throw new Error(
      "This rental request has not been approved by the landlord."
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: rentalRequest.property.title },
          unit_amount: Number(rentalRequest.property.rentPrice) * 100, // Stripe expects cents
        },
        quantity: 1,
      },
    ],
    success_url: `${config.app_url}/success`,
    cancel_url: `${config.app_url}/cancel`,
    metadata: { requestId },
  });

  return { url: session.url };
};

export const paymentService = {
  createCheckoutSession,
};