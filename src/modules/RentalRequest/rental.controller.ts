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
    // Extract user info from the request object (populated by auth middleware)
  const user = req.user as { id: string; role: string };

  const result = await rentalService.getAllRentalRequests(user);

  sendResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Rental requests retrieved successfully",
    data: result,
  });

})

const getRentalRequestById = catchAsync(async (req: Request, res: Response) => {
  // 1. Extract the request ID from parameters
  const { requestId } = req.params; 
  
  // 2. Extract the authenticated user from the request
  const user = req.user as { id: string; role: string };

  // 3. Pass both the ID and the user object to the service
  const result = await rentalService.getRentalRequestById(requestId as string, user);

  sendResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Rental request retrieved successfully",
    data: result,
  });
})

// rental.controller.ts
const updateRentalRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const { id } = req.params;
  const user = req.user as { id: string; role: string }; // Get from auth middleware

  const result = await rentalService.updateRentalRequestStatus(status, id as string, user);
  
  sendResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Status updated successfully.",
    data: result,
  });
});

export const rentalController = {
  createRentalRequest ,
  getAllRentalRequests,
  updateRentalRequestStatus,
  getRentalRequestById,
};
