
import httpsStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const paylod = req.body;
    const { accessToken, refreshToken } = await authService.logInUser(paylod);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, //24 hour or 1 day
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, //24 hour or 1 day
    });

    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "User Loged in Successfuly",
      data: { accessToken, refreshToken },
    });
  },
);



export const authController = {
  loginUser,
//   refreshToken,
};