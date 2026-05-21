export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error("[api] Error:", err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && err.stack ? { stack: err.stack } : {}),
  });
}
