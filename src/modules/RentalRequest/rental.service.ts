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

const getAllRentalRequests = async () => {
  const result = await prisma.rentalRequest.findMany();
  return result;
};

const getRentalRequestById = async (rentalRequstId: string) => {
  const result = await prisma.rentalRequest.findFirstOrThrow({
    where: { id: rentalRequstId },
  });
  return result;
};

const updateRentalRequestStatus = async (
  status: RentalRequentStatus,
  rentalRequstId: string,
) => {
  const result = await prisma.rentalRequest.update({
    where: { id: rentalRequstId },
    data: {
      status,
    },
  });
  return result;
};

export const rentalService = {
  createRentalRequest,
  getAllRentalRequests,
  getRentalRequestById,
  updateRentalRequestStatus,
};
