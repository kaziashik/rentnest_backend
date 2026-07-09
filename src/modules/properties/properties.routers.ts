import { Router } from "express";
import { propertyController } from "./properties.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";


const router=Router()


router.get("/", propertyController.getAllProperties);
router.get("/:id", propertyController.getPropertyById);
router.post("/landlord",auth(Role.LANDLORD,Role.ADMIN), propertyController.createProperty);
router.put("/landlord/:id", propertyController.updateProperty);
router.delete("/landlord/:id", propertyController.deleteProperty);


export const propertiesRouter = router;


