import { AvailabilityStatus, Prisma } from "../../../prisma/generated/prisma/client";

export interface IProperty {
  categoryId: string;
  title: string;
  location: string;
  rentPrice: number;
  bedRooms: number;
  bathRooms: number;
  fetures: Prisma.InputJsonValue;
  availability?: AvailabilityStatus;
  property_image?: Prisma.InputJsonValue;
}