import { Router } from "express";
import { catagoryController } from "./catagory.controller";
import { Role } from "../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";





const router=Router()

router.post("/",auth(Role.ADMIN, Role.LANDLORD),catagoryController.creatPropertyCategorie);
router.get("/",catagoryController.getPropertyCategories)
router.put("/:id",auth(Role.ADMIN, Role.LANDLORD),catagoryController.updatePropertyCategorie)
router.delete("/:id",auth(Role.ADMIN, Role.LANDLORD),catagoryController.deletPropertyCategorie)

export const categoryRouter=router;