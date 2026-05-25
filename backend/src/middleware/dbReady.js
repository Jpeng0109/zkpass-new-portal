/** Set by server bootstrap once MongoDB is connected */
export let databaseReady = false;
export let databaseError = null;

export function setDatabaseReady(ready, err = null) {
  databaseReady = ready;
  databaseError = err;
}

export function requireDatabase(req, res, next) {
  if (databaseReady) return next();
  res.status(503).json({
    success: false,
    message: databaseError
      ? "Database connection failed"
      : "Database is still connecting — retry in a few seconds",
    db: databaseError ? "error" : "connecting",
  });
}
