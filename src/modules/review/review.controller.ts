import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const payload = req.body;
    const result = await reviewService.createReview(
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

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.getAllReviews();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieved successfully.",
    data: result,
  });
});

const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await reviewService.getReviewById(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review retrieved successfully.",
    data: result,
  });
});

export const reviewController = {
  createReview,
  getAllReviews,
  getReviewById,
};
