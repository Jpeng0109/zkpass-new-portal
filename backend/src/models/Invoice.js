import mongoose from "mongoose";

const STATUSES = ["Paid", "Unpaid", "Overdue"];

const lineItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lineId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
    invoiceId: { type: String, required: true, unique: true },
    issued: { type: String, required: true },
    due: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: STATUSES, default: "Unpaid", index: true },
    lineItems: { type: [lineItemSchema], default: [] },
    paidTotal: { type: Number },
    paymentTxHash: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

invoiceSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this.invoiceId,
    issued: this.issued,
    amount: this.amount,
    status: this.status,
    due: this.due,
    lineItems: this.lineItems,
    paidTotal: this.paidTotal,
    paymentTxHash: this.paymentTxHash,
  };
};

export const Invoice = mongoose.model("Invoice", invoiceSchema);
