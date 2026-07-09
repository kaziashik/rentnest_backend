import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";


const router=Router()

router.get("/",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.getAllRentalRequests)
router.get("/:requestId",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.getRentalRequestById)
router.put("/:id/status",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.updateRentalRequestStatus)
router.post("/",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.createRentalRequest)

export const rentlRequestRouter=router
