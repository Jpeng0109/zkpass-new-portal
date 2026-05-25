import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDatabase } from "./db.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { corsOriginCallback } from "./cors.js";
import {
  databaseReady,
  databaseError,
  requireDatabase,
  setDatabaseReady,
} from "./middleware/dbReady.js";

const PORT = Number(process.env.PORT) || 5000;

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: corsOriginCallback,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "zkpassportal-api",
    version: "1.0.0",
    docs: "/api/v1/projects",
    health: "/health",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "zkpassportal-api",
    version: "1.0.0",
    port: PORT,
    db: databaseReady ? "connected" : databaseError ? "error" : "connecting",
  });
});

app.use("/api/v1", requireDatabase, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function connectDatabaseBackground() {
  try {
    await connectDatabase();
    setDatabaseReady(true);
  } catch (err) {
    setDatabaseReady(false, err);
    console.error("[db] Failed to connect:", err.message);
  }
}

function bootstrap() {
  app.listen(PORT, () => {
    console.log(`[api] zkPass Portal API listening on http://localhost:${PORT}`);
    console.log(`[api] CORS: CLIENT_ORIGIN + ${process.env.CORS_ALLOW_VERCEL === "false" ? "no" : ""} *.vercel.app`);
    void connectDatabaseBackground();
  });
}

bootstrap();
