import bcrypt from "bcryptjs";
import { Role } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import config from "../../config";
// import { RegisterUserPayload } from "./user.interface"

interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  photo?: string;

  // name, email, password, profilePhoto
}

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, role, phone } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });
  if (role !== "TENANT" && role !== "LANDLORD") {
    throw new Error("Invalid role. Choose either TENANT or LANDLORD.");
  }

  if (isUserExist) {
    throw new Error("User with this email already exists");
  }
  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );
  const createduser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      role,
      phone,
    },
  });
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: createduser.id,
      email: createduser.email || email,
    },
    omit: {
      password: true,
    },
  });
  return user;
};


const getMyprofileDB = async (userId : any) => {
  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId },
    omit: { password: true },
  });

  return user;
};


const updateMyProfileDB = async (userId: any, payload: any) => {
  const { name, email, password, role, phone } = payload;
  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );
  const updateUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      password: hashPassword,
      role,
      phone,
    },
    omit: {password: true}
  });
  return updateUser;
};

export const userService = {
  registerUserIntoDB,
  getMyprofileDB,
  updateMyProfileDB,
};
