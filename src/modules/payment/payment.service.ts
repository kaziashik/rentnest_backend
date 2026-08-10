import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { fulfillPaidCheckout } from "./payment.fulfill";

const createCheckoutSession = async (requestId: string, tenantId: string) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { property: true },
  });

  if (!rentalRequest) {
    throw new Error("Retal Request Not found.");
  }
  if (rentalRequest.tenantId !== tenantId) {
    throw new Error("This is not your rental Request.");
  }

  if (rentalRequest.status !== "APPROVED") {
    throw new Error(
      "This rental request has not been approved by the landlord plz wait for approve or contat admin.",
    );
  }

  let appUrl =
    config.app_url?.replace(/\/$/, "") ||
    "https://rentnest-frontend-theta.vercel.app";

  // Guard against misconfigured APP_URL values like ".../success"
  appUrl = appUrl
    .replace(/\/payment\/success$/i, "")
    .replace(/\/success$/i, "")
    .replace(/\/$/, "");

  // Always land on /payment/success with Stripe's session id so we can fulfill
  // even when the webhook is delayed or missing on Vercel.
  const successUrl = `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appUrl}/payment/cancel`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: rentalRequest.property.title },
          unit_amount: Number(rentalRequest.property.rentPrice) * 100,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      requestId,
      propertyId: rentalRequest.propertyId,
      tenantId,
    },
  });

  return { url: session.url };
};

const confirmCheckoutSession = async (
  sessionId: string,
  tenantId?: string | null,
) => {
  if (!sessionId) {
    throw new Error("Checkout session id is required.");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Stripe reports this checkout is not paid yet.");
  }

  const requestId = session.metadata?.requestId;
  if (!requestId) {
    throw new Error("Checkout session is missing rental request metadata.");
  }

  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    select: { id: true, tenantId: true, status: true, propertyId: true },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found for this payment.");
  }

  // Optional auth check — Stripe session id is the primary proof of payment
  if (tenantId && rentalRequest.tenantId !== tenantId) {
    throw new Error("This payment does not belong to your account.");
  }

  const result = await fulfillPaidCheckout({
    requestId,
    amountTotal: session.amount_total,
    paymentIntent:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
    sessionId: session.id,
  });

  return {
    requestId,
    propertyId: rentalRequest.propertyId,
    status: "ACTIVE",
    availability: "UNAVAILABLE",
    alreadyFulfilled: result.alreadyFulfilled,
    payment: result.payment,
  };
};




const getMyPayments = async (tenantId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      rentalRequest: {
        tenantId,
      },
    },

    include: {
      rentalRequest: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              rentPrice: true,
              property_image: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

const getPaymentDetailsById = async (paymentId: string, user: { id: string; role: string }) => {
  const payment = await prisma.payment.findFirstOrThrow({
    where: {
      id: paymentId,
    },
    include: {
      rentalRequest: {
        include: {
          property: true,
        },
      },
    },
  });

   if (!payment ){
    throw new Error( "Payment not found.");
    }

    const isOWner=payment.rentalRequest.tenantId===user.id;
    const islandlordOfProperty=payment.rentalRequest.property.propertyOwnerId===user.id;

    if(user.role !=="ADMIN" && !isOWner && !islandlordOfProperty){
       throw new Error( "You are not allowed to view this payment.");
    }
    

  return payment;
};

export const paymentService = {
  createCheckoutSession,
  confirmCheckoutSession,
  getMyPayments,
  getPaymentDetailsById,
};
