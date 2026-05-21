import mongoose from "mongoose";

const ROLES = ["admin", "billing", "auditor"];

const userSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    apiKey: { type: String, required: true, unique: true, index: true },
    roles: {
      type: [{ type: String, enum: ROLES }],
      default: ["admin"],
    },
    activeRole: { type: String, enum: ROLES, default: "admin" },
    remainingCredits: { type: Number, default: 42100.5, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    organizationName: this.organizationName,
    email: this.email,
    roles: this.roles,
    activeRole: this.activeRole,
    remainingCredits: this.remainingCredits,
  };
};

export const User = mongoose.model("User", userSchema);
