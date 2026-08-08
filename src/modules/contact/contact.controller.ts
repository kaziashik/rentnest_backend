import httpsStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const submitContact = catchAsync(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  // Persist-ready hook: currently acknowledges and logs structured payload for ops.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[contact]", { name, email, subject, messageLength: message?.length });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Message received. Our team will get back to you shortly.",
    data: { name, email, subject },
  });
});

export const contactController = {
  submitContact,
};
