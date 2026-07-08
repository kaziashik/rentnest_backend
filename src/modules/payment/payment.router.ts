import { Router } from "express";

import { auth } from "../../middlewares/auth";

import { Role } from "../../../prisma/generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/create-checkout-session",
  auth(Role.TENANT,Role.ADMIN,Role.LANDLORD),
  paymentController.createCheckoutSession
);

export const paymentRoutes = router;