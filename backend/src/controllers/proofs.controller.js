import { verifyProof } from "../services/proof.service.js";

export async function postVerify(req, res) {
  const { projectId, ...payload } = req.body;
  if (!projectId) return res.status(400).json({ success: false, message: "projectId required" });

  const result = await verifyProof({
    account: req.account,
    projectId,
    payload,
  });
  res.json({ success: true, ...result });
}
