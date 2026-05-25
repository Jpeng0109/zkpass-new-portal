/**
 * CORS origin check: explicit CLIENT_ORIGIN list + optional all *.vercel.app previews.
 */
export function parseAllowedOriginsList() {
  const raw = process.env.CLIENT_ORIGIN || process.env.ALLOWED_ORIGINS;
  if (!raw) {
    return ["https://zkpass-new-portal.vercel.app"];
  }
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

const VERCEL_ORIGIN = /^https:\/\/[\w-]+(?:-[\w-]+)*\.vercel\.app$/;

export function isCorsAllowed(origin) {
  if (!origin) return true;
  const list = parseAllowedOriginsList();
  if (list.includes(origin)) return true;

  const allowVercel = process.env.CORS_ALLOW_VERCEL !== "false";
  if (allowVercel && VERCEL_ORIGIN.test(origin)) return true;

  if (process.env.NODE_ENV !== "production") {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  }
  return false;
}

export function corsOriginCallback(origin, callback) {
  if (isCorsAllowed(origin)) {
    callback(null, true);
  } else {
    callback(new Error(`CORS blocked origin: ${origin}`));
  }
}
