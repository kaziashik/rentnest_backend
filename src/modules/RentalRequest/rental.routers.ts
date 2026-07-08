import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";


const router=Router()

router.post("/",auth(Role.ADMIN,Role.LANDLORD,Role.TENANT),rentalController.rentalRequestCreat)

export const rentlRequestRouter=router