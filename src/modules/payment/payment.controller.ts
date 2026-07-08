import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const { requestId } = req.body;
  console.log(requestId);
  const result = await paymentService.createCheckoutSession(requestId as string);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Checkout session created",
    data: result,
  });
});

export const paymentController = { createCheckoutSession };