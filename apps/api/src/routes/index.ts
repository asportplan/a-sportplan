import { Router } from "express";
import profileRouter from "./profile.router.js";
import medicalRouter from "./medical.router.js";
import equipmentRouter from "./equipment.router.js";
import programRouter from "./program.router.js";
import workoutLogRouter from "./workout-log.router.js";
import exportRouter from "./export.router.js";

const apiRouter = Router();

apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Aplikasi Beban Latihan API",
    version: "1.0.0",
  });
});

apiRouter.use("/profile", profileRouter);
apiRouter.use("/medical", medicalRouter);
apiRouter.use("/equipments", equipmentRouter);
apiRouter.use("/programs", programRouter);
apiRouter.use("/workout-logs", workoutLogRouter);
apiRouter.use("/export", exportRouter);

export default apiRouter;
