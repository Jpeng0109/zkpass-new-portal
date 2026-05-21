import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDatabase } from "./db.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:8080";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = CLIENT_ORIGIN.split(",").map((o) => o.trim());
      if (!origin || allowed.includes("*") || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
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
  res.json({ ok: true, service: "zkpassportal-api", version: "1.0.0", port: PORT });
});

app.use("/api/v1", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`[api] zkPass Portal API listening on http://localhost:${PORT}`);
    console.log(`[api] CORS allowed: ${CLIENT_ORIGIN}`);
  });
}

bootstrap().catch((err) => {
  console.error("[api] Failed to start:", err);
  process.exit(1);
});
