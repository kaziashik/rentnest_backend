import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { requestId } = req.body;
    const userId=req.user?.id;
    // console.log(requestId);
    const result = await paymentService.createCheckoutSession(
      requestId as string, userId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session created",
      data: result,
    });
  },
);

const confirmCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const sessionId = String(req.body?.sessionId ?? "");
    // Auth is optional — Stripe session id proves payment
    const userId = req.user?.id ?? null;

    const result = await paymentService.confirmCheckoutSession(
      sessionId,
      userId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment confirmed successfully",
      data: result,
    });
  },
);

const getMyPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
  

    const result = await paymentService.getMyPayments(userId as string);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Payment history retrieved successfully",
      data: result,
    });
  },
);

const getPaymentDetailsById = catchAsync(async (req: Request, res: Response, next: NextFunction) =>{
   const user = req.user as { id: string; role: string };
  const { id } = req.params;

  const result = await paymentService.getPaymentDetailsById(id as string, user);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Payment details retrieved successfully",
    data: result,
  });
});




export const paymentController = {
  createCheckoutSession,
  confirmCheckoutSession,
  getMyPayments,
  getPaymentDetailsById ,
};
