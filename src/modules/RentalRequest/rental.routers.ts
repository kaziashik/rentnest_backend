import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";


const router=Router()

router.post("/",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.createRentalRequest)
router.get("/requestCheck/:id",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.getRentalRequestById)
router.get("/requestCheck",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.getAllRentalRequests)

router.put("/requwtResponse/:id",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.updateRentalRequestStatus)

export const rentlRequestRouter=router
