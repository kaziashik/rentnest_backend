import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpsStatus from "http-status";
import { prisma } from "../../lib/prisma";

const registeruser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userService.registerUserIntoDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.CREATED,
      message: "user created successfully",
      data: { user },
    });
  },
);

const getMyprofile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params;
    const profile = await userService.getMyprofileDB(userId);
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "This is your Profile",
      data: { profile },
    });
  },
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params;
    const payload = req.body;

    const updateProfile = await userService.updateMyProfileDB(userId, payload);
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "user Profile Updated succesfully",
      data: {
        updateMyProfile,
      },
    });
  },
);

export const userController = {
  registeruser,
  getMyprofile,
  updateMyProfile,
};
