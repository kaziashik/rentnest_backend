import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpsStatus from "http-status";
import { prisma } from "../../lib/prisma";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userService.registerUserIntoDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.CREATED,
      message: "User registered successfully",
      data: user,
    });
  },
);

const getMyprofile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const profile = await userService.getMyprofileDB(userId);
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Profile retrieved successfull",
      data: profile,
    });
  },
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const payload = req.body;
  

    const updateProfile = await userService.updateMyProfileDB(userId, payload);
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Profile Updated succesfully",
      data: updateProfile,
    });
  },
);

export const userController = {
  registerUser,
  getMyprofile,
  updateMyProfile,
};
