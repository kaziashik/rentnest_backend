import { Prisma } from "../../../prisma/generated/prisma/client";
import { AvailabilityStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";

interface IProperty {
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

const createProperty = async (userId: string, paylod: IProperty) => {
  const result = await prisma.property.create({
    data: {
      ...paylod,
      propertyOwnerId: userId,
    },
    include:{
        category: true
    }
  });
  return result;
};

const updateProperty = async (paylod: IProperty, propertyId: string) => {
  const result = await prisma.property.update({
    where: { id: propertyId },
    data: {
      ...paylod,
    },
    include: {
      category: true,
    },
  });
  return result;
};

const getAllProperties = async () => {
  const gettAllProperty = await prisma.property.findMany();
  return gettAllProperty;
};

const getPropertyById = async (propertyId: string) => {
  const result = await prisma.property.findFirstOrThrow({
    where: { id: propertyId },
    include: {
      category: true,
    },
  });
  return result;
};

const getPropertyCategories = async() => {
    const result= await prisma.category.findMany({
        select:{
            id: true,
            name: true,
        }
    })
    return result;
};

const deleteProperty =async (propertyId: string) => {
    const result=await prisma.property.delete({
        where:{id: propertyId}
    })
    return result;
};

export const propertyService = {
  getAllProperties,
  getPropertyById,
  getPropertyCategories,
  createProperty,
  updateProperty,
  deleteProperty,
};
