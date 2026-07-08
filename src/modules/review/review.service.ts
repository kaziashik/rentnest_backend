import { prisma } from "../../lib/prisma";
import { IReview } from "./review.interface";

const createReview = async (payload: IReview, tenantId: string) => {
  const result= await prisma.review.create({
    data: {
      ...payload,
      tenantId, 
    },
  });
  return result
};


// const result = await prisma.$transaction(async (tx) => {
//   const request = await tx.rentalRequest.findUnique({ where: { id: payload.requestId } });
  
//   if (request?.status !== 'COMPLETED') throw new Error("Request not completed");

//   return await tx.review.create({ data: { ...payload, tenantId } });
// });


export const reviewService={
    createReview
}