import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import { sendResponse } from "../../utils/sendResponse";
import httpsStatus from "http-status";



const getAlluser=catchAsync(async(req: Request, res: Response, next:NextFunction)=>{
    const allUsers= await adminService.getAlluser()

    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "user Profile Updated succesfully",
      data: {
        allUsers,
      },
    });
})

export const adminController={
    getAlluser
}