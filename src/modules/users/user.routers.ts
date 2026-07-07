import { Router } from "express";
import { userController } from "./user.controller";



const router=Router();

router.post("/register",userController.registeruser);
router.get("/me",userController.getMyprofile);
router.put("/myProfile",userController.updateMyProfile)


export const userRouter=router;