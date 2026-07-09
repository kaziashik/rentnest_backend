import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { jwtutils } from "../../utils/jwt";
import config from "../../config";
import { SignOptions } from "jsonwebtoken";
import { ILoginuser } from "./auth.interface";



const logInUser=async(payload: ILoginuser)=>{
    const {email,password}=payload;

    const user=await prisma.user.findFirstOrThrow({
        where: {email},
    })

    if(user.activeStatus==="BANNED"){
        throw new Error("your Account has been blocked.plz contest support");
    }

    const isPasswordMatch=await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
        throw new Error("password is incorrect")
    }

    const jwtPayload={
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken=jwtutils.createToken(
        jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in as SignOptions,
    )
    
  const refreshToken = jwtutils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };

}



export const authService={
    logInUser

}