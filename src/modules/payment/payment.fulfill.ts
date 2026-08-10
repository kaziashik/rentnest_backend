import { prisma } from "../../lib/prisma";

type FulfillInput = {
  requestId: string;
  amountTotal?: number | null;
  paymentIntent?: string | null;
  sessionId?: string | null;
};

async function ensureActiveRental(requestId: string, propertyId: string) {
  await prisma.$transaction([
    prisma.rentalRequest.updateMany({
      where: {
        id: requestId,
        status: { in: ["APPROVED", "PENDING"] },
      },
      data: { status: "ACTIVE" },
    }),
    prisma.property.update({
      where: { id: propertyId },
      data: { availability: "UNAVAILABLE" },
    }),
  ]);
}

/**
 * Idempotently mark a rental as paid:
 * - create/update PAID payment row
 * - set rental request ACTIVE
 * - set property UNAVAILABLE
 */
export async function fulfillPaidCheckout({
  requestId,
  amountTotal,
  paymentIntent,
  sessionId,
}: FulfillInput) {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    select: { id: true, propertyId: true, tenantId: true, status: true },
  });

  if (!rentalRequest) {
    throw new Error(`Rental request ${requestId} was not found`);
  }

  const existing = await prisma.payment.findUnique({
    where: { requestId },
  });

  if (existing) {
    if (existing.paymentStatus !== "PAID") {
      await prisma.payment.update({
        where: { id: existing.id },
        data: {
          paymentStatus: "PAID",
          amount: (amountTotal ?? Number(existing.amount) * 100) / 100,
          transactionId:
            paymentIntent ||
            (sessionId ? `stripe_${sessionId}` : existing.transactionId),
          paidAt: new Date(),
        },
      });
    }

    await ensureActiveRental(requestId, rentalRequest.propertyId);

    const payment = await prisma.payment.findUniqueOrThrow({
      where: { requestId },
    });

    return {
      alreadyFulfilled: existing.paymentStatus === "PAID",
      payment,
      rentalRequestId: rentalRequest.id,
      propertyId: rentalRequest.propertyId,
    };
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
