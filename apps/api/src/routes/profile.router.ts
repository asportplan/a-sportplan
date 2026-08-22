import { requireAuth } from '../middleware/auth.middleware.js';
import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller.js";

const router = Router();

router.get("/", requireAuth, ProfileController.getProfile);
router.put("/", requireAuth, ProfileController.upsertProfile);
router.post("/", requireAuth, ProfileController.upsertProfile);

export default router;
