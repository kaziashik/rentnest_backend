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



export const adminService = {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  deleteUser,
};