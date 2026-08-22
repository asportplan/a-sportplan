import { requireAuth } from '../middleware/auth.middleware.js';
import { Router } from "express";
import { ProgramController } from "../controllers/program.controller.js";

const router = Router();

router.post("/generate", requireAuth, ProgramController.generateProgram);
router.get("/active", requireAuth, ProgramController.getActiveProgram);

export default router;
