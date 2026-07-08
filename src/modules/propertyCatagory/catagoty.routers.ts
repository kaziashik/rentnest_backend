import { Router } from "express";
import { catagoryController } from "./catagory.controller";





const router=Router()

router.post("/",catagoryController.creatPropertyCategorie);
router.get("/",catagoryController.getPropertyCategories)
router.put("/:id",catagoryController.updatePropertyCategorie)
router.delete("/:id",catagoryController.deletPropertyCategorie)

export const categoryRouter=router;