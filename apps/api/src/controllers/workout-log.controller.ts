import { Request, Response, NextFunction } from "express";
import { WorkoutLogService } from "../services/workout-log.service.js";

export class WorkoutLogController {
  static async logSet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId || "test-user-id";
      const result = await WorkoutLogService.logSet(userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getLogsForProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const programId = Array.isArray(req.params.programId) ? req.params.programId[0] : (req.params.programId as string);
      const logs = await WorkoutLogService.getLogsForProgram(programId);
      res.json({ success: true, logs });
    } catch (err) {
      next(err);
    }
  }
}
