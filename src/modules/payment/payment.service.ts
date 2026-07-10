import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";

const createCheckoutSession = async (requestId: string, tenantId: string) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { property: true },
  });

  if(!rentalRequest){
    throw new Error("Retal Request Not found.")
  }
  if(rentalRequest.tenantId !==tenantId){
    throw new Error("This is not your rental Request.")
  }

  if (rentalRequest.status !== "APPROVED") {
    throw new Error(
      "This rental request has not been approved by the landlord plz wait for approve or contat admin.",
    );
  }


  //creat the payment session
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
  getMyPayments,
  getPaymentDetailsById,
};
