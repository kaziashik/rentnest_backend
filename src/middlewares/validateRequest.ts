import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validateRequest =
  (schema: ZodType) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
