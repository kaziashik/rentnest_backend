import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.get("/allusers", auth(Role.ADMIN), adminController.getAllUsers);
router.get("/user/:id", adminController.getSingleUser);
router.patch("/user/:id/status", adminController.updateUserStatus);
router.delete("/user/:id", adminController.deleteUser);

router.get("/dashboard", auth(Role.ADMIN), adminController.getAdminDashboard);

export const adminRouter = router;
