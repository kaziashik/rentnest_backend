import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router=Router();


router.post("/login",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),authController.loginUser)

export const authRouter=router;