import { Router } from "express";
import { reviewController } from "./review.controller";
import { Role } from "../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";


const router=Router()

router.post("/",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),reviewController.createReview)

export const revewRouter=router;