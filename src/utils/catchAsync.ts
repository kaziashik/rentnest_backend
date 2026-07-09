import { NextFunction, Request, RequestHandler, Response } from "express";
import httpsStatus from "http-status";

export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log(error);

      res.status(httpsStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        StatusCodes: httpsStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to Register user",
        error: (error as Error).message,
      });
      next(error)
    }
  };
};
