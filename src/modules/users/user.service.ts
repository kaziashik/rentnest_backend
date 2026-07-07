import bcrypt from "bcryptjs";
import { Role } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import config from "../../config";
// import { RegisterUserPayload } from "./user.interface"

interface RegisterUserPayload{
    name: string;
    email: string;
    password: string;
    role  :    Role ;      
    phone? :    string;
    photo? :    string

    // name, email, password, profilePhoto 
}

const registerUserIntoDB=async(payload: RegisterUserPayload)=>{
    
    const {name, email, password,role,phone}=payload;
    const isUserExist=await prisma.user.findUnique({
        where: {email},
    });
    if(isUserExist){
        throw new Error ("User with this email already exists")
    }

    const hashPassword=await bcrypt.hash(
        password,Number(config.bcrypt_salt_rounds),
    )

    const createduser=await prisma.user.create({
        data: {
            name,
            email,
            password: hashPassword,
            role,
            phone
        }
    });

    // if(payload.role==="LANDLORD"){
    //     await prisma.property.create({
    //         data: {

    //         }
    //     })
    // }

    const user =await prisma.user.findFirstOrThrow({
        where: {
            id: createduser.id,
            email: createduser.email || email,
        },
        omit: {
            password: true
        },

    })

    return user;

}



export const userService={
    registerUserIntoDB
}