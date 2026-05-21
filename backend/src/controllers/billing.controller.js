import { topUpProject, payInvoice, listInvoices } from "../services/billing.service.js";

export async function getInvoices(req, res) {
  const invoices = await listInvoices(req.account._id);
  res.json({
    success: true,
    accountCredits: req.account.remainingCredits,
    invoices: invoices.map((i) => i.toClientJSON()),
  });
}

export async function postTopUp(req, res) {
  const { projectId, amount, txHash } = req.body;
  if (!projectId || !amount || !txHash) {
    return res.status(400).json({ success: false, message: "projectId, amount, and txHash required" });
  }
  const result = await topUpProject({ account: req.account, projectId, amount, txHash });
  req.account = await req.account.constructor.findById(req.account._id);
  res.json({ success: true, ...result, accountCredits: req.account.remainingCredits });
}

export async function postPayInvoice(req, res) {
  const { invoiceId, txHash } = req.body;
  if (!invoiceId || !txHash) {
    return res.status(400).json({ success: false, message: "invoiceId and txHash required" });
  }
  const result = await payInvoice({ account: req.account, invoiceId, txHash });
  req.account = await req.account.constructor.findById(req.account._id);
  res.json({ success: true, ...result, accountCredits: req.account.remainingCredits });
}
