import { Project } from "../models/Project.js";
import { buildDashboardPayload } from "../services/template.service.js";

export async function getDashboard(req, res) {
  const project = await Project.findOne({
    _id: req.params.projectId,
    accountId: req.account._id,
  });
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });

  const dashboard = await buildDashboardPayload(project);
  res.json({ success: true, ...dashboard, accountCredits: req.account.remainingCredits });
}
