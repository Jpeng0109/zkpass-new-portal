import mongoose from "mongoose";

const STATUSES = ["VERIFIED", "PENDING", "FAILED"];

const zkProofSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    proofId: { type: String, required: true },
    name: { type: String, required: true },
    ticker: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, enum: STATUSES, required: true, index: true },
    txHash: { type: String, required: true },
    merkleRoot: { type: String, required: true },
    verifiedAt: { type: Date, default: Date.now },
    /** Raw zkTLS payload for audit */
    payload: { type: mongoose.Schema.Types.Mixed },
    creditCost: { type: Number, default: 0 },
  },
  { timestamps: true },
);

zkProofSchema.index({ projectId: 1, proofId: 1 }, { unique: true });

zkProofSchema.methods.toClientJSON = function toClientJSON() {
  const date = this.verifiedAt
    ? this.verifiedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  return {
    id: this.proofId,
    name: this.name,
    ticker: this.ticker,
    amount: this.amount,
    status: this.status,
    date,
    txHash: this.txHash,
    merkleRoot: this.merkleRoot,
  };
};

export const ZKProof = mongoose.model("ZKProof", zkProofSchema);
