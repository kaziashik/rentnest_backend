import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginValidationSchema } from "./auth.validation";

const router = Router();

router.post("/login", validateRequest(loginValidationSchema), authController.loginUser);
router.post("/refresh-token", authController.refreshToken);

export const authRouter = router;