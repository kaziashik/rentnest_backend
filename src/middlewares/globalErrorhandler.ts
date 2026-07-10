import { NextFunction, Request, Response } from "express";
import httpsStatus from "http-status";

import { prisma } from "../lib/prisma";
import { Prisma } from "../../prisma/generated/prisma/client";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err);
  let statusCode;
  let errorMessage = err.message || "Internal Server Error";
  let errorNmae = err.name || "Internal Server Error";
  // let errorDetails=err.stack

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpsStatus.BAD_REQUEST;
    errorMessage = "you have Provided incorret fild type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      ((statusCode = httpsStatus.BAD_REQUEST),
        (errorMessage = "Duplicate Key Error"));
    } else if (err.code === "P2003") {
      ((statusCode = httpsStatus.BAD_REQUEST),
        (errorMessage = "Foreign key constraint failed"));
    } else if (err.code === "P2025") {
      ((statusCode = httpsStatus.BAD_REQUEST),
        (errorMessage =
          "An operation Faild because it depends on one or more records that were requered but not found "));
    }
    if (err.code === "P2025") {
      errorMessage =
        "The requested resource was not found. Please check the ID.";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      ((statusCode = httpsStatus.UNAUTHORIZED),
        (errorMessage =
          "Authentication Failed against database server. please check your credentials"));
    } else if (err.errorCode === "P1001") {
      ((statusCode = httpsStatus.BAD_REQUEST),
        (errorMessage = "can not reach databse server"));
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    ((statusCode = httpsStatus.INTERNAL_SERVER_ERROR),
      (errorMessage = "Error Occured During Query Execution "));
  }else if (err instanceof SyntaxError && "body" in err) {   
    statusCode = httpsStatus.BAD_REQUEST;
    errorMessage = "Invalid JSON in request body. Please check your syntax.";
  }
  res.status(statusCode || httpsStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    StatusCodes: statusCode || httpsStatus.INTERNAL_SERVER_ERROR,
    name: errorNmae,
    message: errorMessage,
    error: err.stack,
  });
};
