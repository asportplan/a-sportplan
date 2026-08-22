import { Request, Response, NextFunction } from "express";
import { ExportService } from "../services/export.service.js";

export class ExportController {
  static async exportProgramJson(req: Request, res: Response, next: NextFunction) {
    try {
      const programId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const data = await ExportService.getExportData(programId);
      res.json({ success: true, exportData: data });
    } catch (err) {
      next(err);
    }
  }
}
