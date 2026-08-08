import { Router } from "express";
import { reviewController } from "./review.controller";
import { Role } from "../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";


const router=Router()

router.post("/",auth(Role.TENANT),reviewController.reviewCreate)
router.get("/tenant-reviews",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT), reviewController.getReviewsByTenant );
router.get("/:propertyId",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT), reviewController.getReviewsByProperty);

export const revewRouter=router;