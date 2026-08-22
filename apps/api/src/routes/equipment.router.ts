import { requireAuth } from '../middleware/auth.middleware.js';
import { Router } from "express";
import { EquipmentController } from "../controllers/equipment.controller.js";

const router = Router();

router.get("/master", requireAuth, EquipmentController.getMasterEquipments);
router.get("/user", requireAuth, EquipmentController.getUserEquipments);
router.put("/user", requireAuth, EquipmentController.syncUserEquipments);
router.get("/mvw-check", requireAuth, EquipmentController.checkMVW);

export default router;
