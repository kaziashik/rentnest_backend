import { RentalRequentStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IRequest } from "./rental.interface";


const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["ACTIVE"],
  ACTIVE: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};



const createRentalRequest = async (payload: IRequest, tenantId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });
  if (!property) {
    throw new Error("Property not found");
  }
  if (property.availability !== "AVAILABLE") {
    throw new Error("This Property is Not currently available.");
  }
  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
    },
  });

  if (existingRequest) {
    throw new Error(
      "You already have an active request for this property. Please wait for a decision.",
    );
  }

  const request = await prisma.rentalRequest.create({
    data: {
      ...payload,
      tenantId,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      property: {
        include: {
          propertyOwner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
  if (user.role === "TENANT") {
    where.tenantId = user.id;
  }
  // 2. Landlord: Only see requests for properties they own
  else if (user.role === "LANDLORD") {
    where.property = {
      propertyOwnerId: user.id, // Updated to match your Prisma model field
    };
  }
  // 3. Admin: Sees all records

  const result = await prisma.rentalRequest.findMany({
    where,
    include: {
      tenant: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, title: true, rentPrice: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getRentalRequestById = async (
  id: string,
  user: { id: string; role: string },
) => {
  const where: any = { id };

  // Apply the same ownership restriction used in getAllRentalRequests
  if (user.role === "TENANT") {
    where.tenantId = user.id;
  } else if (user.role === "LANDLORD") {
    where.property = { propertyOwnerId: user.id };
  }
  // Admins see all (where remains {id})

  const result = await prisma.rentalRequest.findFirstOrThrow({
    where,
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      property: true,
    },
  });

  return result;
};

const updateRentalRequestStatus = async (
  status: RentalRequentStatus,
  id: string,
  user: { id: string; role: string },
) => {
  const where: any = { id };

  if (user.role === "LANDLORD") {
    where.property = { propertyOwnerId: user.id };
  }

  const current = await prisma.rentalRequest.findFirstOrThrow({ where }).catch(() => {
    throw new Error( "Rental request not found.");
  });

  const allowedNext = ALLOWED_TRANSITIONS[current.status] || [];
  if (!allowedNext.includes(status)) {
    throw new Error(
      `Cannot change status from ${current.status} to ${status}. have to pay or need to End the rental date`,
    );
  }
  // If an Admin is logged in, the 'where' object is JUST { id }
  // This allows the Admin to bypass the owner check.

  const result = await prisma.rentalRequest.update({
    where,
    data: { status },
  });

  // when approved, take the property off the market so it can't be double-booked
  if (status === "APPROVED") {
    await prisma.property.update({
      where: { id: current.propertyId },
      data: { availability: "UNAVAILABLE" },
    });
  }
  return result;
};

export const rentalService = {
  createRentalRequest,
  getAllRentalRequests,
  getRentalRequestById,
  updateRentalRequestStatus,
};
