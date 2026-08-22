import { requireAuth } from '../middleware/auth.middleware.js';
import { Router } from "express";
import { MedicalController } from "../controllers/medical.controller.js";

const router = Router();

router.post("/screening", requireAuth, MedicalController.submitScreening);
router.get("/screening", requireAuth, MedicalController.getLatestScreening);

export default router;
