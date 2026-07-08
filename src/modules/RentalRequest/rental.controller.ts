import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpsStatus from "http-status"
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";


const rentalRequestCreat = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{
 const payload=req.body;
 const tenantId=req.user?.id;

  const result= await rentalService.rentalRequestCreat(payload, tenantId as string)
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.CREATED,
      message: "Property category created successfully ",
      data: result,
    });
})

const rentalRequestCheck = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{})

const returnSingleRequest = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{})

const landlordRequsApproveOrRejectCheck = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{})

export const rentalController = {
  rentalRequestCreat ,
  rentalRequestCheck,
  landlordRequsApproveOrRejectCheck,
  returnSingleRequest,
};
