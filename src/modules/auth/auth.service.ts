import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { jwtutils } from "../../utils/jwt";
import config from "../../config";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { ILoginuser } from "./auth.interface";
import { error } from "node:console";



const logInUser=async(payload: ILoginuser)=>{
    const {email,password}=payload;

    const user=await prisma.user.findFirst({
        where: {email},
    })
    if (!user) {
    throw new Error( "Invalid email or password.");
  }

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



const refreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtutils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );
  if (!verifiedRefreshToken.success) {
    throw new Error(verifiedRefreshToken.error);
  }
  const { id } = verifiedRefreshToken.data as JwtPayload;
  const user = await prisma.user.findFirstOrThrow({
    where: { id },
  });

  if (user.activeStatus === "BANNED") {
    throw new Error("user is blocked!");
  }

  const jwtPayload = {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtutils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

return {accessToken};
};



export const authService={
    logInUser,
     refreshToken,

}