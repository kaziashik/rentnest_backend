import { prisma } from "../../lib/prisma"


const getAlluser= async ()=>{
    const users=await prisma.user.findMany();
    return users
}

export const adminService={
    getAlluser
}