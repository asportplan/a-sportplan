import { Request, Response, NextFunction } from "express";
import { ProgramService } from "../services/program.service.js";

export class ProgramController {
  static async generateProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId || "test-user-id";
      const result = await ProgramService.generateProgram(userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getActiveProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.query.userId as string || "test-user-id";
      const programData = await ProgramService.getActiveProgram(userId);
      res.json({ success: true, programData });
    } catch (err) {
      next(err);
    }
  }
}
