import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpsStatus from "http-status"
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";
import { prisma } from "../../lib/prisma";


const rentalRequestCreat = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{
 const payload=req.body;
 const tenantId=req.user?.id;

  const result= await rentalService.rentalRequestCreat(payload, tenantId as string)
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.CREATED,
      message: "Property  request created successfully ",
      data: result,
    });
})

const rentalRequestCheck = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{
    const result=await rentalService.rentalRequestCheck()
      sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Property all Request retrive successfully ",
      data: result,
    });

})

const returnSingleRequest = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{
    
    const {requestId}=req.params;

    const result=await rentalService.returnSingleRequest(requestId as string)
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Property Request retrive successfully ",
      data: result,
    });


})

const landlordRequsApproveOrRejectCheck = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{
    console.log(req.body);
    const {status}=req.body;
    console.log("checkResponse",req.params);
    const {id}=req.params;
    console.log(id);
    
    const result=await rentalService.landlordRequsApproveOrRejectCheck(status,id as string )
     sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Property Request Response  successfully ",
      data: result,
    });
})

export const rentalController = {
  rentalRequestCreat ,
  rentalRequestCheck,
  landlordRequsApproveOrRejectCheck,
  returnSingleRequest,
};
