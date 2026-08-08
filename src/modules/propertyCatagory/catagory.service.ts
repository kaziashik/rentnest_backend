import { prisma } from "../../lib/prisma";
import { ICateoryPayload } from "./catagory.interface";


const creatPropertyCategorie=async(payload: ICateoryPayload)=>{
    const result= await prisma.category.create({
        data: {
            ...payload
        }
    })

    return result

}

const getPropertyCategories = async() => {
    const result= await prisma.category.findMany({
        select:{
            id: true,
            name: true,
        }
    })
    return result;
};

const updatePropertyCategorie=async(payload: ICateoryPayload, catagoryId: string)=>{
     const result= await prisma.category.update({
        where: {id: catagoryId},
        data: {
            ...payload
        }
    })

    return result
    
}


const deletPropertyCategorie=async(catagoryId: string)=>{
    const result= await prisma.category.delete({
        where: {id: catagoryId},     
    })
    return result 
}

export const catagoryService={
    creatPropertyCategorie,
    getPropertyCategories,
    updatePropertyCategorie,
    deletPropertyCategorie

}
