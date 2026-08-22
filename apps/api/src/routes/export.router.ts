import { requireAuth } from '../middleware/auth.middleware.js';
import { Router } from "express";
import { ExportController } from "../controllers/export.controller.js";

const router = Router();

router.get("/:id", requireAuth, ExportController.exportProgramJson);

export default router;
