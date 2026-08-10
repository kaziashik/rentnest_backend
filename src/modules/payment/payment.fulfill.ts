import { prisma } from "../../lib/prisma";

type FulfillInput = {
  requestId: string;
  amountTotal?: number | null;
  paymentIntent?: string | null;
  sessionId?: string | null;
};

/**
 * Idempotently mark a rental as paid:
 * - create PAID payment row
 * - set rental request ACTIVE
 * - set property UNAVAILABLE
 */
export async function fulfillPaidCheckout({
  requestId,
  amountTotal,
  paymentIntent,
  sessionId,
}: FulfillInput) {
  const existing = await prisma.payment.findUnique({
    where: { requestId },
  });

  if (existing) {
    return {
      alreadyFulfilled: true,
      payment: existing,
    };
  }

  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    select: { id: true, propertyId: true, tenantId: true, status: true },
  });

  if (!rentalRequest) {
    throw new Error(`Rental request ${requestId} was not found`);
  }

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        requestId,
        amount: (amountTotal ?? 0) / 100,
        paymentStatus: "PAID",
        transactionId:
          paymentIntent ||
          (sessionId ? `stripe_${sessionId}` : `paid_${requestId}`),
        paymentMethod: "STRIPE",
        paidAt: new Date(),
      },
    }),
    prisma.rentalRequest.update({
      where: { id: requestId },
      data: { status: "ACTIVE" },
    }),
    prisma.property.update({
      where: { id: rentalRequest.propertyId },
      data: { availability: "UNAVAILABLE" },
    }),
  ]);

  return {
    alreadyFulfilled: false,
    payment,
    rentalRequestId: rentalRequest.id,
    propertyId: rentalRequest.propertyId,
  };
}
