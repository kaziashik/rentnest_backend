import { prisma } from "../../lib/prisma";
import { IReview } from "./review.interface";

const createReview = async (payload: IReview, tenantId: string) => {
  const result = await prisma.review.create({
    data: {
      ...payload,
      tenantId,
    },
  });
  return result;
};

// const result = await prisma.$transaction(async (tx) => {
//   const request = await tx.rentalRequest.findUnique({ where: { id: payload.requestId } });

//   if (request?.status !== 'COMPLETED') throw new Error("Request not completed");

//   return await tx.review.create({ data: { ...payload, tenantId } });
// });

const getAllReviews = async () => {
  const result = await prisma.review.findMany({
    include: {
      property: true,
      tenant: true,
      rentalRequest: true,
    },
  });

  return result;
};

const getReviewById = async (reviewId: string) => {
  const result = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
    },
    include: {
      property: true,
      tenant: true,
      rentalRequest: true,
    },
  });

  return result;
};

export const reviewService = {
  createReview,
  getAllReviews,
  getReviewById,
};
