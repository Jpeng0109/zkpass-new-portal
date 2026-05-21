import { Project } from "../models/Project.js";
import { ZKProof } from "../models/ZKProof.js";
import { TEMPLATE_META } from "../constants/templates.js";
import crypto from "crypto";

export async function listProjects(req, res) {
  const projects = await Project.find({ accountId: req.account._id }).sort({ createdAt: -1 });
  res.json({
    success: true,
    accountCredits: req.account.remainingCredits,
    projects: projects.map((p) => p.toClientJSON()),
  });
}

export async function createProject(req, res) {
  const { name, owner, templateType, proofType, status = "Active", initialTopUp = 0 } = req.body;
  const type = templateType || proofType;
  if (!name || !owner || !type || !TEMPLATE_META[type]) {
    return res.status(400).json({ success: false, message: "name, owner, and valid templateType required" });
  }

  const appId = crypto.randomBytes(6).toString("hex").toUpperCase();
  const project = await Project.create({
    accountId: req.account._id,
    name,
    owner,
    status,
    templateType: type,
    proofType: type,
    appId,
    walletBalance: Number(initialTopUp) || 0,
    totalSpend: Number(initialTopUp) || 0,
  });

  const seeds = TEMPLATE_META[type].seedProofs || [];
  await ZKProof.insertMany(
    seeds.map((s) => ({
      projectId: project._id,
      proofId: s.proofId,
      name: s.name,
      ticker: s.ticker,
      amount: s.amount,
      status: s.status,
      txHash: s.txHash,
      merkleRoot: s.merkleRoot,
      verifiedAt: new Date(),
    })),
  );
  project.proofAmount = seeds.length;
  await project.save();

  res.status(201).json({ success: true, project: project.toClientJSON() });
}
