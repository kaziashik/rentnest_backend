import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  registerValidationSchema,
  updateProfileValidationSchema,
} from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerValidationSchema),
  userController.registerUser,
);
router.get(
  "/me",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  userController.getMyprofile,
);
router.put(
  "/updateProfile",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  validateRequest(updateProfileValidationSchema),
  userController.updateMyProfile,
);

export const userRouter = router;
