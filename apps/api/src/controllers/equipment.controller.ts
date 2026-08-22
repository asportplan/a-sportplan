import { Request, Response, NextFunction } from "express";
import { EquipmentService } from "../services/equipment.service.js";

export class EquipmentController {
  static async getMasterEquipments(req: Request, res: Response, next: NextFunction) {
    try {
      const equipments = await EquipmentService.getMasterEquipments();
      res.json({ success: true, equipments });
    } catch (err) {
      next(err);
    }
  }

  static async getUserEquipments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.query.userId as string || "test-user-id";
      const equipments = await EquipmentService.getUserEquipments(userId);
      res.json({ success: true, equipments });
    } catch (err) {
      next(err);
    }
  }

  static async syncUserEquipments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId || "test-user-id";
      const items = req.body.equipments || (Array.isArray(req.body) ? req.body : []);
      const updated = await EquipmentService.syncUserEquipments(userId, items);
      res.json({ success: true, equipments: updated });
    } catch (err) {
      next(err);
    }
  }

  static async checkMVW(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.query.userId as string || "test-user-id";
      const mvwResult = await EquipmentService.checkMVW(userId);
      res.json({ success: true, mvwResult });
    } catch (err) {
      next(err);
    }
  }
}
