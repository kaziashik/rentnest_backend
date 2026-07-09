import { Prisma } from "../../../prisma/generated/prisma/client";
import { AvailabilityStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IProperty } from "./properties.interface";



const createProperty = async (userId: string, payload: IProperty) => {


  if (payload.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!categoryExists) {
      throw new Error(`The category you selected does not exist.`);
    }
  }

  const result = await prisma.property.create({
    data: {
      ...payload,
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


const getAllProperties = async (query:any) => {

  const {
    location,
    minPrice,
    maxPrice,
    category,
    sort,
    page = "1",
    limit = "10"
  } = query;


  const skip =
    (Number(page)-1) * Number(limit);



  const properties = await prisma.property.findMany({

    where:{


      ...(location && {
        location:{
          contains:location,
          mode:"insensitive"
        }
      }),


      ...(minPrice && {
        rentPrice:{
          gte:Number(minPrice)
        }
      }),


      ...(maxPrice && {
        rentPrice:{
          lte:Number(maxPrice)
        }
      }),


      ...(category && {
        category:{
          name:{
            equals:category,
            mode:"insensitive"
          }
        }
      })


    },


    include:{

      category:{
        select:{
          name:true
        }
      },


      propertyOwner:{
        select:{
          name:true,
          email:true,
          phone:true
        }
      }

    },


    orderBy:
      sort === "price_asc"
      ? {
          rentPrice:"asc"
        }
      :
      sort === "price_desc"
      ? {
          rentPrice:"desc"
        }
      :
      {
        createdAt:"desc"
      },


    skip,

    take:Number(limit)

  });



  const total =
    await prisma.property.count({
      where:{
        ...(location && {
          location:{
            contains:location,
            mode:"insensitive"
          }
        })
      }
    });



  return {

    meta:{
      page:Number(page),
      limit:Number(limit),
      total
    },

    data:properties

  };

};


const updateProperty = async (
  payload: IProperty,
  propertyId: string,
  user: { id: string; role: string },
) => {


  let property;
  try {
    property = await prisma.property.findUniqueOrThrow({
      where: { id: propertyId },
    });
  } catch (error) {
    throw new Error("Property not found. Please check the ID and try again.");
  }

  


  if (user.role === "TENANT") {
    throw new Error("Tenant cannot update property");
  }

  if (user.role === "LANDLORD" && property.propertyOwnerId !== user.id) {
    throw new Error("You are not allowed to update this property");
  }


  if (payload.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!categoryExists) {
      throw new Error(`The category you selected does not exist.`);
    }
  }


  return await prisma.property.update({
    where: { id: propertyId },
    data: payload,
    include: {
      category: { select: { name: true } },
      propertyOwner: { select: { name: true, email: true, phone: true } },
    },
  });
};



const getPropertyByOwner = async (propertyOwnerId: string) => {
  try {
    const result = await prisma.property.findMany({
      where: { propertyOwnerId },
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
  } catch (error) {
    throw new Error("You have not creat any property . Please plz clreat.");
  }
};

const getPropertyById = async (propertyId: string) => {
  try {
    const result = await prisma.property.findUniqueOrThrow({
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
  } catch (error) {
    throw new Error("Property not found. Please check the ID and try again.");
  }
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
 const hasRentalRequests = await prisma.rentalRequest.findFirst({
    where: { propertyId: propertyId },
  });

  if (hasRentalRequests) {
    throw new Error("sorry Cannot delete this property because it has existing rental requests Contect with Admin.");
  }
  let property;
  try {
    property = await prisma.property.findUniqueOrThrow({
      where: { id: propertyId },
    });
  } catch (error) {
    throw new Error("Property not found. Unable to delete.");
  }

  // 2. Authorization checks
  if (user.role === "TENANT") {
    throw new Error("Tenant cannot delete property.");
  }

  if (user.role === "LANDLORD" && property.propertyOwnerId !== user.id) {
    throw new Error("You are not allowed to delete this property.");
  }

  // 3. Perform the delete
  return await prisma.property.delete({
    where: { id: propertyId },
  });
};

export const propertyService = {
  getAllProperties,
  getPropertyById,
  getPropertyCategories,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyByOwner
};
