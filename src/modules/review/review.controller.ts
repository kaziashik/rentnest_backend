import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const reviewCreate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const payload = req.body;
    const result = await reviewService.reviewCreate(
      payload,
      tenantId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review created successfully",
      data: result,
    });
  },
);

const getReviewsByTenant = catchAsync(async (req: Request, res: Response) => {
  const tenantId= req.user?.id;
  
  const result = await reviewService.getReviewsByTenant(tenantId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieved successfully.",
    data: result,
  });
});

const getReviewsByProperty = catchAsync(async (req: Request, res: Response) => {
  const {propertyId} = req.params;

  const result = await reviewService.getReviewsByProperty(propertyId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property reviews retrieved successfully.",
    data: result,
  });
});

export const reviewController = {
  reviewCreate,
  getReviewsByTenant,
  getReviewsByProperty,
};
