import { RentalRequentStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IReview } from "./review.interface";

const reviewCreate = async (payload: IReview, tenantId: string) => {
  const result= await prisma.$transaction(async (tx) => {

    const rentalRequest = await tx.rentalRequest.findFirstOrThrow({
      where: { id: payload.requestId },
    });

    if (rentalRequest.tenantId !== tenantId) {
      throw new Error("You are not authorized to review this property.");
    }


    if (rentalRequest.status !== RentalRequentStatus.COMPLETED) {
      throw new Error("You can only review a property after the rental has been completed.");
    }

    
    const existingReview = await tx.review.findUnique({
      where: { requestId: payload.requestId },
    });

    if (existingReview) {
      throw new Error("You have already submitted a review for this rental.");
    }

   
    return await tx.review.create({
      data: {
        ...payload,
        tenantId,
      },
    });
  });
  return result;
};


const getReviewsByTenant = async ( tenantId: string) => {
  const result = await prisma.review.findMany({
    where:{id: tenantId},
    include: {
      property:
      {
        select:{
          title: true,
          location: true,
          rentPrice: true
        }
      }
    },
  });

  return result;
};

const getReviewsByProperty = async (propertyId: string) => {
  // 1. Fetch data in a single transaction to ensure consistency and performance
  const [reviews, stats] = await prisma.$transaction([
    prisma.review.findMany({
      where: { propertyId },
      include: {
        tenant: {
          select: { name: true, photo: true },
        },
      },
    }),
    prisma.review.aggregate({
      where: { propertyId },
      _count: { id: true },
      _avg: { rating: true },
    }),
  ]);

  // 2. Map the results to a clear, easy-to-use structure
  return {
    reviews,
    totalCount: stats._count.id,
    averageRating: stats._avg.rating || 0, // Fallback to 0 if no reviews exist
  };
};

export const reviewService = {
  reviewCreate,
  getReviewsByTenant,
  getReviewsByProperty,
};
