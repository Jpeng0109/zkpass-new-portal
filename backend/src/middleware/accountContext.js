import { User } from "../models/User.js";
import { asyncHandler } from "./errorHandler.js";

/** Resolves default account for demo — replace with JWT in production */
export const attachAccount = asyncHandler(async (req, _res, next) => {
  const account = await User.findOne().sort({ createdAt: 1 });
  if (!account) {
    const err = new Error("No account seeded. Run: npm run seed");
    err.statusCode = 503;
    throw err;
  }
  req.account = account;
  next();
});
