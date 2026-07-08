import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "./properties.service";
import { sendResponse } from "../../utils/sendResponse";
import httpsStatus from "http-status";
import { prisma } from "../../lib/prisma";

const createProperty = catchAsync( async (req: Request, res: Response, next: NextFunction)=>{
    console.log(req.body);
    const userId = req.user?.id as string;
    const payload = req.body;
   

    const result = await propertyService.createProperty(
      userId,
      payload,
      
    );

    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.CREATED,
      message: "Property Creted succesfully",
      data: result,
    });
})

const updateProperty = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const {id}=req.params
    console.log(req.params);
    const paylod=req.body
    const result= await propertyService.updateProperty(paylod, id as string)
     sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Property updated succesfully",
      data: result,
    });
});

const getAllProperties = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    console.log(req);
    const result=await propertyService.getAllProperties()
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "All property  retrive succesfully ",
      data: result,
    });
})

const getPropertyById = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const {propertyId}=req.params;
    const result= await propertyService.getPropertyById(propertyId as string)
     sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "property  retrive succesfully ",
      data: result,
    });

});

const getPropertyCategories = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const result=await propertyService.getPropertyCategories()
     sendResponse(res, {
      success: true,
      statusCode: httpsStatus.CREATED,
      message: "All property  catagory succesfully ",
      data: {result},
    });
});



const deleteProperty = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{});

export const propertyController = {
  getAllProperties,
  getPropertyById,
  getPropertyCategories,
  createProperty,
  updateProperty,
  deleteProperty,
};
