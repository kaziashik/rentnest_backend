import { Router } from "express";
import { contactController } from "./contact.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { contactValidationSchema } from "./contact.validation";

const router = Router();

router.post(
  "/",
  validateRequest(contactValidationSchema),
  contactController.submitContact,
);

export const contactRouter = router;
