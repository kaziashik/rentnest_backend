import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpsStatus from "http-status";

const registeruser= catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const payload=req.body;
    console.log(payload);
    const user=await userService.registerUserIntoDB(payload);

    sendResponse(res,{
        success: true,
        statusCode: httpsStatus.CREATED,
        message: "user created successfully",
        data: {user}
    });

})

export const userController={
    registeruser
}