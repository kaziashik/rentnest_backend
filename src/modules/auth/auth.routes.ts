import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router=Router();


router.post("/login",authController.loginUser)
router.post('/refresh-token',authController.refreshToken)

export const authRouter=router;