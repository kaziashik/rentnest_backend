import { Router } from "express";
import { reviewController } from "./review.controller";
import { Role } from "../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";


const router=Router()

router.post("/",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),reviewController.createReview)
router.get("/",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT), reviewController.getAllReviews);
router.get("/:id",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT), reviewController.getReviewById);

export const revewRouter=router;