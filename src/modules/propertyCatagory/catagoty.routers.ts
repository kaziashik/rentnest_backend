import { Router } from "express";
import { catagoryController } from "./catagory.controller";
import { Role } from "../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";





const router=Router()

router.post("/",catagoryController.creatPropertyCategorie);
router.get("/",auth(Role.ADMIN),catagoryController.getPropertyCategories)
router.put("/:id",auth(Role.ADMIN),catagoryController.updatePropertyCategorie)
router.delete("/:id",auth(Role.ADMIN),catagoryController.deletPropertyCategorie)

export const categoryRouter=router;