import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "../properties/properties.service";
import { sendResponse } from "../../utils/sendResponse";
import httpsStatus from "http-status";
import { catagoryService } from "./catagory.service";


const creatPropertyCategorie = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const paylod = req.body;
    console.log(paylod);
    const result = await catagoryService.creatPropertyCategorie(paylod)
    res.status(201).json({
      success: true,
      message: "Property category created successfully",
      data: result,
    });
  },
);

const getPropertyCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await catagoryService.getPropertyCategories()
    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "All property  catagory  retrive succesfully ",
      data: result,
    });
  },
);

const updatePropertyCategorie = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const paylod= req.body;
    const {id}=req.params
    const result= await catagoryService.updatePropertyCategorie(paylod, id as string)
     sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: " Category updated successfully ",
      data: result,
    });
  },
);

const deletPropertyCategorie = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {id}=req.params
    const result= await catagoryService.deletPropertyCategorie( id as string)
     sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: " delete updated successfully ",
      data: result,
    });
  },
);


export const catagoryController = {
  creatPropertyCategorie,
  getPropertyCategories,
  updatePropertyCategorie,
  deletPropertyCategorie,
};
