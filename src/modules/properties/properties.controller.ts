import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "./properties.service";
import { sendResponse } from "../../utils/sendResponse";
import httpsStatus from "http-status";

const createProperty = catchAsync( async (req: Request, res: Response, next: NextFunction)=>{
   
    const userId = req.user?.id as string;
    const payload = req.body;
   

    const result = await propertyService.createProperty(
      userId,
      payload,
      
    );

    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.CREATED,
      message: "Property Created successfully",
      data: result,
    });
})

const updateProperty = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
  const { id } = req.params;
  const payload = req.body;
  const user = req.user as { id: string; role: string }; // Get from auth middleware

    const result = await propertyService.updateProperty(payload, id as string, user);

     sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Property updated succesafully",
      data: result,
    });
});

const getAllProperties = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
  
    const result=await propertyService.getAllProperties()
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "properties  retrive successfully ",
      data: result,
    });
})

const getPropertyById = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const {propertyId}=req.params;
    const result= await propertyService.getPropertyById(propertyId as string)
     sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "property  retrived successfully ",
      data: result,
    });

});

const getPropertyCategories = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const result=await propertyService.getPropertyCategories()
     sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "property  catagories retrived succesfully ",
      data: result,
    });
});




const deleteProperty = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
  const { id } = req.params;
   
  const payload = req.body;
  const user = req.user as { id: string; role: string }; // Get from auth middleware

  await propertyService.deleteProperty(id as string, user);

  sendResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Property deleted successfully.",
    data: null,
  });
});

export const propertyController = {
  getAllProperties,
  getPropertyById,
  getPropertyCategories,
  createProperty,
  updateProperty,
  deleteProperty,
};
