import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users retrieved successfully.",
      data: result,
    });
  },
);

const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await adminService.getSingleUser(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User retrieved successfully.",
      data: result,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const result = await adminService.updateUserStatus(id as string, status);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully.",
      data: result,
    });
  },
);

const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await adminService.deleteUser(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User deleted successfully.",
      data: null,
    });
  },
);

export const adminController = {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  deleteUser,
};
