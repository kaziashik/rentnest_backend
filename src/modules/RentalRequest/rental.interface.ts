import { RentalRequentStatus } from "../../../prisma/generated/prisma/enums";

export interface IRequest {
  propertyId: string;
  message?: string;
  moveInDate: Date;
  // status: RentalRequentStatus;
}