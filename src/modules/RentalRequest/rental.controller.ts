import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpsStatus from "http-status"
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";
import { prisma } from "../../lib/prisma";


const createRentalRequest = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{
 const payload=req.body;
 const tenantId=req.user?.id;

  const result= await rentalService.createRentalRequest(payload, tenantId as string)
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.CREATED,
      message: "Rental request created successfully ",
      data: result,
    });
})

const getAllRentalRequests = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{
    const result=await rentalService.getAllRentalRequests()
      sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Rental requests retrieved successfully",
      data: result,
    });

})

const getRentalRequestById = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{
    
    const {requestId}=req.params;

    const result=await rentalService.getRentalRequestById(requestId as string)
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Rental request retrieved successfully",
      data: result,
    });


})

const updateRentalRequestStatus = catchAsync(async(req: Request,res:Response,next: NextFunction)=>{
    const {status}=req.body;
    const {id}=req.params;
    const result=await rentalService.updateRentalRequestStatus(status,id as string )
     sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Rental request status updated successfully.",
      data: result,
    });
})

export const rentalController = {
  createRentalRequest ,
  getAllRentalRequests,
  updateRentalRequestStatus,
  getRentalRequestById,
};
