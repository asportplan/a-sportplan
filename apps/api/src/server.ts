import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/better-auth.js";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { initDb } from "./db/index.js";

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// Better Auth Route Handler
app.all("/api/auth/*", toNodeHandler(auth));

// API v1 Router
app.use("/api/v1", apiRouter);

// Serve Frontend Static Files
app.use(express.static('public'));

// Error Middleware
app.use(errorHandler);

// Initialize DB tables on startup
initDb().then(() => {
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`[Server] Aplikasi Beban Latihan API running on http://localhost:${PORT}`);
    });
  }
});

export default app;
