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
     include: {
      category: {
        select: {
          name: true,
        },
      },
      propertyOwner: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
  return result;
};

const updateProperty = async (
  payload: IProperty,
  propertyId: string,
  user: { id: string; role: string },
) => {

  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });


  // Landlord can update only their own property
  if (
    user.role === "LANDLORD" &&
    property.propertyOwnerId !== user.id
  ) {
    throw new Error("You are not allowed to update this property");
  }


  // Tenant cannot update property
  if (user.role === "TENANT") {
    throw new Error("Tenant cannot update property");
  }


  const result = await prisma.property.update({
    where: {
      id: propertyId,
    },
    data: payload,
    include: {
      category: {
        select: {
          name: true,
        },
      },
      propertyOwner: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });


  return result;
};

const getAllProperties = async () => {
  const gettAllProperty = await prisma.property.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
      propertyOwner: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
  return gettAllProperty;
};

const getPropertyById = async (propertyId: string) => {
  const result = await prisma.property.findFirstOrThrow({
    where: { id: propertyId },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      propertyOwner: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
  return result;
};

const getPropertyCategories = async () => {
  const result = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  return result;
};

const deleteProperty = async (
  propertyId: string,
  user: { id: string; role: string },
) => {

  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });


  // Landlord can delete only their own property
  if (
    user.role === "LANDLORD" &&
    property.propertyOwnerId !== user.id
  ) {
    throw new Error(
      "You are not allowed to delete this property."
    );
  }


  // Tenant cannot delete property
  if (user.role === "TENANT") {
    throw new Error(
      "Tenant cannot delete property."
    );
  }


  const result = await prisma.property.delete({
    where: {
      id: propertyId,
    },
  });


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
