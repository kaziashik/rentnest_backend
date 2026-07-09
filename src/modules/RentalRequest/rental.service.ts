import { RentalRequentStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IRequest } from "./rental.interface";

const createRentalRequest = async (payload: IRequest, tenantId: string) => {
  const request = await prisma.rentalRequest.create({
    data: {
      ...payload,
      tenantId,
    },
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      review: true,
    },
  });
  return request;
};

const getAllRentalRequests = async (user: { id: string; role: string }) => {
  const where: any = {};

  // 1. Tenant: Only see their own requests
  if (user.role === 'TENANT') {
    where.tenantId = user.id;
  } 
  // 2. Landlord: Only see requests for properties they own
  else if (user.role === 'LANDLORD') {
    where.property = {
      propertyOwnerId: user.id // Updated to match your Prisma model field
    };
  }
  // 3. Admin: Sees all records

 const result= await prisma.rentalRequest.findMany({
    where,
    include: {
      tenant: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, title: true, rentPrice: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return result
};

const getRentalRequestById = async (rentalRequstId: string) => {
  const result = await prisma.rentalRequest.findFirstOrThrow({
    where: { id: rentalRequstId },
  });
  return result;
};

const updateRentalRequestStatus = async (
  status: RentalRequentStatus,
  id: string,
  user: { id: string; role: string }
) => {
  const where: any = { id };

 // Only add this filter if a Landlord is logged in
  
  if (user.role === 'LANDLORD') {
    where.property = { propertyOwnerId: user.id };
  }
  // If an Admin is logged in, the 'where' object is JUST { id }
// This allows the Admin to bypass the owner check.

  const result= await prisma.rentalRequest.update({
    where,
    data: { status },
  });
  return result
};

export const rentalService = {
  createRentalRequest,
  getAllRentalRequests,
  getRentalRequestById,
  updateRentalRequestStatus,
};
