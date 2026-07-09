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
    const { activeStatus} = req.body;
    console.log(activeStatus);

    const result = await adminService.updateUserStatus(id as string, activeStatus);

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

    const result=await adminService.deleteUser(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User deleted successfully.",
      data: result,
    });
  },
);


const getAdminDashboard = catchAsync(
async(req,res)=>{


 const dashboard = await adminService.getAdminDashboard();



 sendResponse(res,{
    success:true,
    statusCode:200,
    message:"Admin dashboard data retrieved successfully",
    data:dashboard
 });


});

export const adminController = {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  deleteUser,
  getAdminDashboard
};
