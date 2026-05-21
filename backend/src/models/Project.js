import mongoose from "mongoose";
import { TEMPLATE_TYPES } from "../constants/templates.js";

const STATUSES = ["Active", "Paused", "Review"];

const projectSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    owner: { type: String, required: true, trim: true },
    status: { type: String, enum: STATUSES, default: "Active" },
    templateType: {
      type: String,
      enum: TEMPLATE_TYPES,
      required: true,
      index: true,
    },
    /** Alias used by frontend — same as templateType */
    proofType: {
      type: String,
      enum: TEMPLATE_TYPES,
      required: true,
    },
    totalSpend: { type: Number, default: 0, min: 0 },
    proofAmount: { type: Number, default: 0, min: 0 },
    walletBalance: { type: Number, default: 0, min: 0 },
    appId: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

projectSchema.pre("validate", function syncProofType(next) {
  if (this.templateType && !this.proofType) this.proofType = this.templateType;
  if (this.proofType && !this.templateType) this.templateType = this.proofType;
  next();
});

projectSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    owner: this.owner,
    status: this.status,
    totalSpend: this.totalSpend,
    proofAmount: this.proofAmount,
    appId: this.appId,
    proofType: this.proofType,
    templateType: this.templateType,
    walletBalance: this.walletBalance,
  };
};

export const Project = mongoose.model("Project", projectSchema);
