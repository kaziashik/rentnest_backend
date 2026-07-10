import bcrypt from "bcryptjs";
import { Role } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { RegisterUserPayload } from "./user.interface";
// import { RegisterUserPayload } from "./user.interface"



const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, role, phone } = payload;

  

  if(!name || !email || !password){
    throw new Error ("Name, Email, Password are Required");
  }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
      throw new Error(" Please provide a valid email address")
    }

    if(password.length<5){
      throw new Error("please must be at least 5 characters.")
    }

    if (role !== "TENANT" && role !== "LANDLORD") {
    throw new Error("Invalid role. Choose either TENANT or LANDLORD.");
  }

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });


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


const updateMyProfileDB = async (userId: string, payload: any) => {
  const { name, email, password, phone } = payload;
 

  const data: Record<string, any> = {};

  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (phone !== undefined) data.phone = phone;

  if (password !== undefined) {
    // if (password.length < 5) {
    //   throw new Error("Password must be at least 8 characters.");
    // }
    data.password = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
  }

  if (Object.keys(data).length === 0) {
    throw new Error("No valid fields provided to update.");
  }

  const updateUser = await prisma.user.update({
    where: { id: userId },
    data,
    omit: { password: true },
  });
  return updateUser;
};

export const userService = {
  registerUserIntoDB,
  getMyprofileDB,
  updateMyProfileDB,
};
