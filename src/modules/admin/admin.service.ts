import { UserStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma"


const getAllUsers = async () => {

  const users = await prisma.user.findMany({
    omit:{ password: true}
  });

  return users;
};



const getSingleUser = async (userId: string) => {

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit:{ password: true}
  });

  return user;
};



const updateUserStatus = async (
  userId: string,
  activeStatus: UserStatus
) => {

  if (activeStatus !== "ACTIVE" && activeStatus !== "BANNED") {
    throw new Error( "activeStatus must be either ACTIVE or BANNED.");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      activeStatus,
    },
    omit:{password:true}
  });

  return updatedUser;
};



const deleteUser = async (userId: string) => {

  const userDelet= await prisma.user.delete({
    where: {
      id: userId,
    },
    omit: {password: true}
  });

  return userDelet;
};


const getAdminDashboard = async () => {

  const totalUsers = await prisma.user.count();


  const totalTenants = await prisma.user.count({
    where:{
      role:"TENANT"
    }
  });


  const totalLandlords = await prisma.user.count({
    where:{
      role:"LANDLORD"
    }
  });



  const totalProperties = await prisma.property.count();


  const availableProperties = await prisma.property.count({
    where:{
      availability :"AVAILABLE"
    }
  });


  const rentedProperties = await prisma.property.count({
    where:{
      availability :"UNAVAILABLE"
    }
  });



  const totalRentalRequests = await prisma.rentalRequest.count();



  const pendingRequests = await prisma.rentalRequest.count({
    where:{
      status:"PENDING"
    }
  });


  const approvedRequests = await prisma.rentalRequest.count({
    where:{
      status:"APPROVED"
    }
  });



  const totalPayments = await prisma.payment.count();



  const revenue = await prisma.payment.aggregate({
    _sum:{
      amount:true
    },
    where:{
      paymentStatus:"PAID"
    }
  });



  return {

    users:{
      total:totalUsers,
      tenants:totalTenants,
      landlords:totalLandlords
    },


    properties:{
      total:totalProperties,
      available:availableProperties,
      rented:rentedProperties
    },


    rentalRequests:{
      total:totalRentalRequests,
      pending:pendingRequests,
      approved:approvedRequests
    },


    payments:{
      total:totalPayments,
      revenue:revenue._sum?.amount || 0
    }

  };

};

export const adminService = {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  deleteUser,
  getAdminDashboard
};