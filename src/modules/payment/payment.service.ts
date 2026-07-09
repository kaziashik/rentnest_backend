import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";

const createCheckoutSession = async (requestId: string) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { property: true },
  });

  // Allow payment only after landlord approval
  if (rentalRequest.status !== "APPROVED") {
    throw new Error(
      "This rental request has not been approved by the landlord plz wait for approve or contat admin.",
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
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  if (payments.length === 0) {
    throw new Error("You Don't Have Any paymanet history");
  }
  return payments;
};

const getPaymentDetailsById = async (paymentId: string) => {
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

  return payment;
};

export const paymentService = {
  createCheckoutSession,
  getMyPayments,
  getPaymentDetailsById,
};
