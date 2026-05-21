import { Router } from "express";
import { attachAccount } from "../middleware/accountContext.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as projects from "../controllers/projects.controller.js";
import * as dashboard from "../controllers/dashboard.controller.js";
import * as proofs from "../controllers/proofs.controller.js";
import * as billing from "../controllers/billing.controller.js";

const router = Router();
router.use(attachAccount);

router.get("/projects", asyncHandler(projects.listProjects));
router.post("/projects", asyncHandler(projects.createProject));
router.get("/dashboard/:projectId", asyncHandler(dashboard.getDashboard));
router.post("/proofs/verify", asyncHandler(proofs.postVerify));
router.get("/billing/invoices", asyncHandler(billing.getInvoices));
router.post("/billing/topup", asyncHandler(billing.postTopUp));
router.post("/billing/pay-invoice", asyncHandler(billing.postPayInvoice));

export default router;
