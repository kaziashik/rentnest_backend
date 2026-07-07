import { Request, Response } from "express"

export const notFound=(req: Request, res: Response)=>{
  res.status(404).json({
    message: "Rout not fount",
    path:req.originalUrl,
    date:Date()
  })
}