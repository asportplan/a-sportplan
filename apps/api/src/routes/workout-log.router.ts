import { requireAuth } from '../middleware/auth.middleware.js';
import { Router } from "express";
import { WorkoutLogController } from "../controllers/workout-log.controller.js";

const router = Router();

router.post("/", requireAuth, WorkoutLogController.logSet);
router.get("/program/:programId", requireAuth, WorkoutLogController.getLogsForProgram);

export default router;
