import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { requestId } = req.body;
    console.log(requestId);
    const result = await paymentService.createCheckoutSession(
      requestId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session created",
      data: result,
    });
  },
);

const getMyPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    console.log(userId);

    const result = await paymentService.getMyPayments(userId as string);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Payment history retrieved successfully",
      data: result,
    });
  },
);

const getPaymentDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) =>{
  const userId = req.user?.id;

  const { id } = req.params;

  const result = await paymentService.getPaymentDetails(id as string, userId as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Payment details retrieved successfully",
    data: result,
  });
});




export const paymentController = {
  createCheckoutSession,
  getMyPayments,
  getPaymentDetails,
};
