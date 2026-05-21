import { Invoice } from "../models/Invoice.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";

const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;

export async function topUpProject({ account, projectId, amount, txHash }) {
  if (!TX_HASH_RE.test(txHash || "")) {
    throw Object.assign(new Error("Invalid transaction hash"), { statusCode: 400 });
  }
  const amt = Number(amount);
  if (!amt || amt <= 0) throw Object.assign(new Error("Invalid top-up amount"), { statusCode: 400 });

  const project = await Project.findOne({ _id: projectId, accountId: account._id });
  if (!project) throw Object.assign(new Error("Project not found"), { statusCode: 404 });

  if (account.remainingCredits < amt) {
    throw Object.assign(new Error("Insufficient organization credits for top-up"), { statusCode: 402 });
  }

  const feeRate = Number(process.env.TOPUP_PLATFORM_FEE_RATE) || 0.02;
  const fee = amt * feeRate;
  const credited = amt - fee;

  account.remainingCredits -= amt;
  project.walletBalance += credited;
  project.totalSpend += credited;

  await account.save();
  await project.save();

  return {
    projectId: project._id.toString(),
    amount: amt,
    fee,
    credited,
    txHash,
    walletBalance: project.walletBalance,
    accountCredits: account.remainingCredits,
  };
}

export async function payInvoice({ account, invoiceId, txHash }) {
  if (!TX_HASH_RE.test(txHash || "")) {
    throw Object.assign(new Error("Invalid transaction hash"), { statusCode: 400 });
  }

  const invoice = await Invoice.findOne({ accountId: account._id, invoiceId });
  if (!invoice) throw Object.assign(new Error("Invoice not found"), { statusCode: 404 });
  if (invoice.status === "Paid") throw Object.assign(new Error("Invoice already paid"), { statusCode: 409 });

  const taxRate = Number(process.env.INVOICE_TAX_RATE) || 0.15;
  const tax = invoice.amount * taxRate;
  const paidTotal = invoice.amount + tax;

  if (account.remainingCredits < paidTotal) {
    throw Object.assign(new Error("Insufficient credits to pay invoice"), { statusCode: 402 });
  }

  account.remainingCredits -= paidTotal;
  invoice.status = "Paid";
  invoice.paidTotal = paidTotal;
  invoice.paymentTxHash = txHash;
  invoice.paidAt = new Date();

  await account.save();
  await invoice.save();

  return {
    invoice: invoice.toClientJSON(),
    paidTotal,
    accountCredits: account.remainingCredits,
    txHash,
  };
}

export async function listInvoices(accountId) {
  return Invoice.find({ accountId }).sort({ createdAt: -1 });
}
