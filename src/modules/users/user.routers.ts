import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";



const router=Router();

router.post("/register",userController.registerUser);
router.get("/me",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),userController.getMyprofile);
router.put("/updateProfile",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),userController.updateMyProfile)


export const userRouter=router;