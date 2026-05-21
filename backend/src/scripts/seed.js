import "dotenv/config";
import crypto from "crypto";
import { connectDatabase, disconnectDatabase } from "../db.js";
import { User, Project, ZKProof, Invoice } from "../models/index.js";
import { TEMPLATE_META } from "../constants/templates.js";

async function seed() {
  await connectDatabase();
  await Promise.all([User.deleteMany({}), Project.deleteMany({}), ZKProof.deleteMany({}), Invoice.deleteMany({})]);

  const account = await User.create({
    organizationName: "Stellar Cloud Migrations",
    email: "admin@zkpass.demo",
    apiKey: `zkp_${crypto.randomBytes(24).toString("hex")}`,
    roles: ["admin", "billing", "auditor"],
    activeRole: "admin",
    remainingCredits: 42100.5,
  });

  const projectDefs = [
    { name: "Fiat Reserve Oracle", owner: "Alex Rivera", status: "Active", templateType: "ASSET_SOLVENCY", totalSpend: 12450, proofAmount: 3550, appId: "3876623ABCDE" },
    { name: "Prime Broker Custody", owner: "Sarah Chen", status: "Active", templateType: "SYNTHETIC_STOCK", totalSpend: 45200, proofAmount: 18800, appId: "3876623FGHIJ" },
    { name: "RWA Property Vault", owner: "Marco Rossi", status: "Paused", templateType: "REAL_ESTATE_RWA", totalSpend: 8900, proofAmount: 1100, appId: "3876623KLMNO" },
    { name: "E-Commerce Factoring", owner: "Alex Rivera", status: "Review", templateType: "SUPPLY_CHAIN_FACTORING", totalSpend: 124000, proofAmount: 2500, appId: "3876623PQRST" },
    { name: "CEX NAV Monitor", owner: "Lin Wei", status: "Active", templateType: "INSTITUTIONAL_LIQUIDITY", totalSpend: 67400, proofAmount: 9100, appId: "3876623UVWXY" },
  ];

  for (const def of projectDefs) {
    const project = await Project.create({
      accountId: account._id,
      ...def,
      proofType: def.templateType,
      walletBalance: def.totalSpend * 0.1,
    });
    const seeds = TEMPLATE_META[def.templateType].seedProofs;
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
  }

  const invoices = [
    { invoiceId: "INV-2024-001", issued: "Oct 12, 2023", amount: 12500, status: "Paid", due: "Nov 12, 2023" },
    { invoiceId: "INV-2024-002", issued: "Nov 05, 2023", amount: 4200.5, status: "Unpaid", due: "Dec 05, 2023" },
    { invoiceId: "INV-2024-003", issued: "Dec 15, 2023", amount: 890, status: "Paid", due: "Jan 15, 2024" },
    { invoiceId: "INV-2024-004", issued: "Jan 02, 2024", amount: 15750, status: "Overdue", due: "Feb 02, 2024" },
    { invoiceId: "INV-2024-005", issued: "Feb 10, 2024", amount: 2300, status: "Unpaid", due: "Mar 10, 2024" },
  ];

  await Invoice.insertMany(
    invoices.map((inv) => ({
      accountId: account._id,
      ...inv,
      lineItems: [
        { name: "Monthly Managed Services", lineId: "PF-9910", amount: Math.min(3500, inv.amount) },
        { name: "Overage Fees (Data)", lineId: "PF-9911", amount: Math.max(0, inv.amount - 3500) },
      ],
    })),
  );

  console.log("[seed] Database seeded successfully");
  console.log("[seed] API Key:", account.apiKey);
  await disconnectDatabase();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
