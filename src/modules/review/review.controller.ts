import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { reviewService } from "./review.service"
import { sendResponse } from "../../utils/sendResponse";
import httpsStatus from "http-status"




const createReview =catchAsync(async(req:Request, res: Response,next: NextFunction)=>{
    const tenantId=req.user?.id;
    const payload=req.body;
    const result=await reviewService.createReview(payload, tenantId as string)
    sendResponse(res,{
        success: true,
        statusCode: httpsStatus.CREATED,
        message: "Review Created successfully",
        data: result
    })
})
export const reviewController={
    createReview
}