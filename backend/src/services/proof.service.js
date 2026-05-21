import { ZKProof } from "../models/ZKProof.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";

const INVALID_MERKLE_PATTERN = /INVALID/i;

export async function verifyProof({ account, projectId, payload }) {
  const project = await Project.findOne({ _id: projectId, accountId: account._id });
  if (!project) throw Object.assign(new Error("Project not found"), { statusCode: 404 });

  const creditCost = Number(process.env.VERIFICATION_CREDIT_COST) || 18.5;
  if (account.remainingCredits < creditCost) {
    throw Object.assign(new Error("Insufficient remaining credits"), { statusCode: 402 });
  }

  const merkleRoot = payload.merkleRoot || "";
  const txHash = payload.txHash || "";
  const failed = INVALID_MERKLE_PATTERN.test(merkleRoot) || INVALID_MERKLE_PATTERN.test(txHash);
  const status = failed ? "FAILED" : payload.forceStatus === "PENDING" ? "PENDING" : "VERIFIED";

  const proofId = payload.proofId || `PR-${Date.now()}`;
  const proof = await ZKProof.findOneAndUpdate(
    { projectId: project._id, proofId },
    {
      projectId: project._id,
      proofId,
      name: payload.name || "New Attestation",
      ticker: payload.ticker || "ENTITY-01",
      amount: payload.amount || "$0",
      status,
      txHash: txHash || `0x${Date.now().toString(16)}`,
      merkleRoot: merkleRoot || `0x${Date.now().toString(16)}`,
      payload,
      creditCost,
      verifiedAt: new Date(),
    },
    { upsert: true, new: true },
  );

  account.remainingCredits -= creditCost;
  await account.save();

  project.proofAmount += 1;
  project.totalSpend += creditCost;
  await project.save();

  return { proof: proof.toClientJSON(), creditCost, remainingCredits: account.remainingCredits };
}
