import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";


const router=Router()

router.get("/allusers",auth(Role.ADMIN),adminController.getAlluser)


export const adminRouter=router;