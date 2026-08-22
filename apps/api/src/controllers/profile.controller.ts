import { Request, Response, NextFunction } from "express";
import { ProfileService } from "../services/profile.service.js";

export class ProfileController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.query.userId as string || "test-user-id";
      const profile = await ProfileService.getProfileByUserId(userId);
      res.json({ success: true, profile });
    } catch (err) {
      next(err);
    }
  }

  static async upsertProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId || "test-user-id";
      const profile = await ProfileService.upsertProfile(userId, req.body);
      res.json({ success: true, profile });
    } catch (err) {
      next(err);
    }
  }
}
