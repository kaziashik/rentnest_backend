import { RentalRequentStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IRequest } from "./rental.interface";

const rentalRequestCreat = async (payload: IRequest, tenantId: string) => {
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

const rentalRequestCheck = async () => {};

const returnSingleRequest = async () => {};

const landlordRequsApproveOrRejectCheck = async () => {};

export const rentalService = {
  rentalRequestCreat,
  rentalRequestCheck,
  landlordRequsApproveOrRejectCheck,
  returnSingleRequest,
};
