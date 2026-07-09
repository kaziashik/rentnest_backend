import { Router } from "express";

import { auth } from "../../middlewares/auth";

import { Role } from "../../../prisma/generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/create-checkout-session",
  auth(Role.TENANT, Role.ADMIN, Role.LANDLORD),
  paymentController.createCheckoutSession,
);

router.get("/", auth(Role.TENANT), paymentController.getMyPayments);

router.get("/:id", auth(Role.TENANT), paymentController.getPaymentDetails);

export const paymentRoutes = router;
