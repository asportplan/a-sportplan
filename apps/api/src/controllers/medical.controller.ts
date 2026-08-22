import { Request, Response, NextFunction } from "express";
import { MedicalService } from "../services/medical.service.js";

export class MedicalController {
  static async submitScreening(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId || "test-user-id";
      const result = await MedicalService.submitScreening(userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getLatestScreening(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.query.userId as string || "test-user-id";
      const screening = await MedicalService.getLatestScreening(userId);
      res.json({ success: true, screening });
    } catch (err) {
      next(err);
    }
  }
}
