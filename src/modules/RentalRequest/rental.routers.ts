import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";


const router=Router()

router.post("/",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.rentalRequestCreat)
router.get("/requestCheck/:id",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.returnSingleRequest)
router.get("/requestCheck",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.rentalRequestCheck)

router.put("/requwtResponse/:id",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.landlordRequsApproveOrRejectCheck)

export const rentlRequestRouter=router

//   rentalRequestCreat ,
//   rentalRequestCheck,
//   landlordRequsApproveOrRejectCheck,
//   returnSingleRequest,