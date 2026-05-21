import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import * as api from "@/api/endpoints";
import { toast } from "sonner";

export type Role = "admin" | "billing" | "auditor";
export const ROLES: Record<Role, { name: string; title: string; initials: string; color: string }> = {
  admin: { name: "Alex Rivera", title: "Project Admin", initials: "AR", color: "#9eff00" },
  billing: { name: "Sarah Johnson", title: "Billing Specialist", initials: "SJ", color: "#7dd3fc" },
  auditor: { name: "Marcus Aurelius", title: "Platform Auditor", initials: "MA", color: "#fbbf24" },
};

export type ProofType =
  | "ASSET_SOLVENCY"
  | "SYNTHETIC_STOCK"
  | "REAL_ESTATE_RWA"
  | "SUPPLY_CHAIN_FACTORING"
  | "INSTITUTIONAL_LIQUIDITY";

/** zkTLS template identifier (alias of proofType on projects) */
export type TemplateType = ProofType;

export function getTemplateType(project: Project): TemplateType {
  return project.proofType;
}

export const PROOF_TYPES: Record<ProofType, string> = {
  ASSET_SOLVENCY: "Fiat Proof of Reserve",
  SYNTHETIC_STOCK: "Broker Stock Custody",
  REAL_ESTATE_RWA: "Property & Yield Attestation",
  SUPPLY_CHAIN_FACTORING: "E-Commerce Receivables",
  INSTITUTIONAL_LIQUIDITY: "CEX Net Equity Monitor",
};

export type ProofRecord = {
  id: string;
  name: string;
  ticker: string;
  amount: string;
  status: "VERIFIED" | "PENDING" | "FAILED";
  date: string;
  txHash: string;
  merkleRoot: string;
};

export type TemplateMeta = {
  key: ProofType;
  label: string;
  subtitle: string;
  pageTitle: string;
  metricTitles: [string, string, string, string];
  metricValues: [string, string, string, string];
  chartTitle: string;
  chartSubtitle: string;
  chartType: "area" | "bar";
  seed: number;
  assetUnit: string;
  protocol: string;
  proofs: ProofRecord[];
};

export const TEMPLATE_META: Record<ProofType, TemplateMeta> = {
  ASSET_SOLVENCY: {
    key: "ASSET_SOLVENCY",
    label: "Fiat Proof of Reserve",
    subtitle: "Cryptographically attest fiat-denominated bank reserves.",
    pageTitle: "Fiat Attestation",
    metricTitles: ["Fiat Attestation", "Total Fiat Reserves", "Collateralization Ratio", "Custodial Banks"],
    metricValues: ["Bank Balance Verified", "$500,000,000.00", "102.4%", "4 Entities"],
    chartTitle: "Reserve vs Supply Discrepancy",
    chartSubtitle: "Time-series verification of fiat solvency (Last 24h)",
    chartType: "area",
    seed: 0,
    assetUnit: "USD Reserve",
    protocol: "zkTLS · Banking-API v3.1",
    proofs: [
      { id: "PR-1001", name: "JPMorgan Chase", ticker: "ACC-4421", amount: "$185.4M", status: "VERIFIED", date: "Oct 24, 2024", txHash: "0x71c765a8f2b1e4d3c9a7b2e1f0d8c6a5b4e3d2c1", merkleRoot: "0x9a2f4b8c1d3e5f7a9b0c2d4e6f8a1b3c4d5e6f7a8" },
      { id: "PR-1002", name: "Bank of America", ticker: "ACC-9930", amount: "$142.8M", status: "VERIFIED", date: "Oct 24, 2024", txHash: "0x82d876b9a3c2f5e4d0b8c3f2e1a9d7b6c5a4f3e2d1", merkleRoot: "0xab3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0" },
      { id: "PR-1003", name: "Wells Fargo", ticker: "ACC-7712", amount: "$98.2M", status: "PENDING", date: "Oct 23, 2024", txHash: "0x93e987c0b4d3a6f5e1c9d4a3f2b0e8c7d6b5a4f3e2d1", merkleRoot: "0xbc4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2" },
      { id: "PR-1004", name: "Citibank N.A.", ticker: "ACC-3380", amount: "$73.6M", status: "FAILED", date: "Oct 22, 2024", txHash: "0xa4f098d1c5e4b7a6f2d0e5b4a3f2c1d0e9f8a7b6c5d4", merkleRoot: "0xINVALID_ROOT_MISMATCH_0x9a2f" },
      { id: "PR-1005", name: "HSBC Holdings", ticker: "ACC-6651", amount: "$45.0M", status: "VERIFIED", date: "Oct 22, 2024", txHash: "0xb5a109e2d6f5c8b7a3e1f6c5b4a3f2e1d0c9b8a7f6e5", merkleRoot: "0xcd5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3" },
    ],
  },
  SYNTHETIC_STOCK: {
    key: "SYNTHETIC_STOCK",
    label: "Broker Stock Custody",
    subtitle: "Verify custody of equities held at prime brokers.",
    pageTitle: "Equity Stock Proof",
    metricTitles: ["Equity Stock Proof", "Total Custodied Shares", "Liquidity Matching Rate", "Prime Brokers"],
    metricValues: ["AAPL/TSLA Assets Check", "$84,290,120.00", "100.0%", "3 Brokers"],
    chartTitle: "Collateralization Health & Order Match",
    chartSubtitle: "Time-series verification of equity custody (Last 24h)",
    chartType: "area",
    seed: 2,
    assetUnit: "Shares",
    protocol: "zkTLS · Broker-API v2.4",
    proofs: [
      { id: "PR-2001", name: "Apple Inc.", ticker: "AAPL", amount: "210,400 sh", status: "VERIFIED", date: "Oct 24, 2024", txHash: "0xc6b210f3e7a6d9c8b5f2a7e6d5c4b3a2f1e0d9c8b7", merkleRoot: "0xde6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4" },
      { id: "PR-2002", name: "Tesla, Inc.", ticker: "TSLA", amount: "84,900 sh", status: "VERIFIED", date: "Oct 24, 2024", txHash: "0xd7c321a4f8b7e0d9c6a3b8f7e6d5c4b3a2f1e0d9c8", merkleRoot: "0xef7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3" },
      { id: "PR-2003", name: "NVIDIA Corp.", ticker: "NVDA", amount: "55,300 sh", status: "PENDING", date: "Oct 23, 2024", txHash: "0xe8d432b5a9c8f1e0d7b4c9a8f7e6d5c4b3a2f1e0", merkleRoot: "0xfa8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2" },
      { id: "PR-2004", name: "Microsoft Corp.", ticker: "MSFT", amount: "129,100 sh", status: "VERIFIED", date: "Oct 22, 2024", txHash: "0xf9e543c6b0d9a2f1e8c5b0a9f8e7d6c5b4a3f2e1", merkleRoot: "0x0b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1" },
      { id: "PR-2005", name: "Goldman Custody", ticker: "GS-CUS", amount: "32,000 sh", status: "FAILED", date: "Oct 22, 2024", txHash: "0x0af654d7c1e0b3a2f9d6c1b0a9f8e7d6c5b4a3f2", merkleRoot: "0xINVALID_BROKER_ROOT_0x1c2d" },
    ],
  },
  REAL_ESTATE_RWA: {
    key: "REAL_ESTATE_RWA",
    label: "Property & Yield Attestation",
    subtitle: "Attest property deeds, valuations and yield performance.",
    pageTitle: "Deed & Property Proof",
    metricTitles: ["Deed & Property Proof", "Appraised Asset Value", "Occupancy & Yield Rate", "SPV / Trust Entities"],
    metricValues: ["Manhattan Luxury Condo #302", "$18,500,000.00", "88.5% (6.2% APY)", "2 SPVs"],
    chartTitle: "Real-time Rental Cashflow Attestation",
    chartSubtitle: "Monthly rental yield attestation by property (Last 12 mo)",
    chartType: "bar",
    seed: 4,
    assetUnit: "USD Valued",
    protocol: "zkTLS · RWA Registry v1.2",
    proofs: [
      { id: "PR-3001", name: "Manhattan Condo #302", ticker: "DEED-NY-302", amount: "$18.5M", status: "VERIFIED", date: "Oct 24, 2024", txHash: "0x1ab765e8f7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2", merkleRoot: "0x2bc876f9a8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3" },
      { id: "PR-3002", name: "Brooklyn Loft #14B", ticker: "DEED-NY-14B", amount: "$4.2M", status: "VERIFIED", date: "Oct 23, 2024", txHash: "0x2cd987a0b9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4", merkleRoot: "0x3de098a1c0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5" },
      { id: "PR-3003", name: "Miami Beach Villa", ticker: "DEED-FL-VL2", amount: "$12.8M", status: "PENDING", date: "Oct 23, 2024", txHash: "0x3de098b1c0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5", merkleRoot: "0x4ef109b2d1b0a9f8e7d6c5b4a3f2e1d0c9b8a7" },
      { id: "PR-3004", name: "Aspen Chalet 7", ticker: "DEED-CO-07", amount: "$7.9M", status: "FAILED", date: "Oct 22, 2024", txHash: "0x4ef109c2d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8", merkleRoot: "0xINVALID_DEED_ROOT_0x5fa" },
      { id: "PR-3005", name: "Hamptons Estate", ticker: "DEED-NY-HE1", amount: "$22.1M", status: "VERIFIED", date: "Oct 22, 2024", txHash: "0x5fa21ad3e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9", merkleRoot: "0x6ab32be4f4e3d2c1b0a9f8e7d6c5b4a3f2e1a0" },
    ],
  },
  SUPPLY_CHAIN_FACTORING: {
    key: "SUPPLY_CHAIN_FACTORING",
    label: "E-Commerce Receivables",
    subtitle: "Verify storefront revenue, receivables and fulfillment.",
    pageTitle: "Store Storefront Proof",
    metricTitles: ["Store Storefront Proof", "Verified Receivables", "Order Fulfillment Score", "Logistics Platforms"],
    metricValues: ["Amazon US Store-04", "$3,450,000.00", "99.1% (Low Dispute)", "5 Carriers"],
    chartTitle: "Receivables Snapshot",
    chartSubtitle: "Time-series receivables & fulfillment (Last 24h)",
    chartType: "area",
    seed: 6,
    assetUnit: "USD Invoiced",
    protocol: "zkTLS · Commerce-API v2.0",
    proofs: [
      { id: "PR-4001", name: "Amazon US Store-04", ticker: "AMZN-04", amount: "$1.2M", status: "VERIFIED", date: "Oct 24, 2024", txHash: "0x6ac43cf5a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0", merkleRoot: "0x7bd54da6b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1" },
      { id: "PR-4002", name: "Shopify Brand Co.", ticker: "SHOP-BC", amount: "$640K", status: "VERIFIED", date: "Oct 24, 2024", txHash: "0x7bd54da6b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1", merkleRoot: "0x8ce65eb7c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2" },
      { id: "PR-4003", name: "eBay Power Seller", ticker: "EBAY-PS", amount: "$420K", status: "PENDING", date: "Oct 23, 2024", txHash: "0x8ce65eb7c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2", merkleRoot: "0x9df76fc8d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4" },
      { id: "PR-4004", name: "Walmart Marketplace", ticker: "WMT-MP", amount: "$890K", status: "FAILED", date: "Oct 22, 2024", txHash: "0x9df76fc8d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4", merkleRoot: "0xINVALID_STORE_ROOT_0xa1b2" },
      { id: "PR-4005", name: "TikTok Shop CN-7", ticker: "TTS-07", amount: "$300K", status: "VERIFIED", date: "Oct 22, 2024", txHash: "0xa0e87a09e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5", merkleRoot: "0xb1f98b10f0e9d8c7b6a5f4e3d2c1b0a9f8e7" },
    ],
  },
  INSTITUTIONAL_LIQUIDITY: {
    key: "INSTITUTIONAL_LIQUIDITY",
    label: "CEX Net Equity Monitor",
    subtitle: "Monitor net equity and margin health across exchanges.",
    pageTitle: "Exchange Net Balance",
    metricTitles: ["Exchange Net Balance", "Total Net Equity (NAV)", "Maintenance Margin Ratio", "Connected CEXs"],
    metricValues: ["Binance Margin Account #1", "$25,400,000.00", "245.8% (Safe)", "6 Exchanges"],
    chartTitle: "NAV Snapshot",
    chartSubtitle: "Time-series net equity & margin ratio (Last 24h)",
    chartType: "area",
    seed: 8,
    assetUnit: "USD NAV",
    protocol: "zkTLS · Exchange-API v4.0",
    proofs: [
      { id: "PR-5001", name: "Binance Margin #1", ticker: "BNB-M1", amount: "$8.4M", status: "VERIFIED", date: "Oct 24, 2024", txHash: "0xc0a09a01b1f0e9d8c7b6a5f4e3d2c1b0a9f8e7", merkleRoot: "0xd1b10b12c2a1f0e9d8c7b6a5f4e3d2c1b0a9f8" },
      { id: "PR-5002", name: "Coinbase Prime", ticker: "CB-PRM", amount: "$6.1M", status: "VERIFIED", date: "Oct 24, 2024", txHash: "0xd1b10b12c2a1f0e9d8c7b6a5f4e3d2c1b0a9f8", merkleRoot: "0xe2c21c23d3b2a1f0e9d8c7b6a5f4e3d2c1b0" },
      { id: "PR-5003", name: "Kraken Pro", ticker: "KRK-PRO", amount: "$4.2M", status: "PENDING", date: "Oct 23, 2024", txHash: "0xe2c21c23d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9", merkleRoot: "0xf3d32d34e4c3b2a1f0e9d8c7b6a5f4e3d2c1" },
      { id: "PR-5004", name: "OKX Institutional", ticker: "OKX-INS", amount: "$3.5M", status: "FAILED", date: "Oct 22, 2024", txHash: "0xf3d32d34e4c3b2a1f0e9d8c7b6a5f4e3d2c1b0", merkleRoot: "0xINVALID_CEX_ROOT_0xc4d5" },
      { id: "PR-5005", name: "Bybit Derivatives", ticker: "BYB-DRV", amount: "$3.2M", status: "VERIFIED", date: "Oct 22, 2024", txHash: "0xa4e43e45f5d4c3b2a1f0e9d8c7b6a5f4e3d2c1", merkleRoot: "0xb5f54f56a6e5d4c3b2a1f0e9d8c7b6a5f4e3" },
    ],
  },
};

export type Project = {
  id: string;
  name: string;
  owner: string;
  status: "Active" | "Paused" | "Review";
  totalSpend: number;
  proofAmount: number;
  appId: string;
  proofType: ProofType;
  walletBalance?: number;
};

export type InvoiceLineItem = {
  name: string;
  lineId: string;
  amount: number;
};

export type Invoice = {
  id: string;
  issued: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Overdue";
  due: string;
  lineItems?: InvoiceLineItem[];
  paidTotal?: number;
  paymentTxHash?: string;
};

type Store = {
  role: Role;
  setRole: (r: Role) => void;
  projects: Project[];
  projectsLoading: boolean;
  addProject: (body: { name: string; owner: string; templateType: ProofType; initialTopUp?: number }) => Promise<Project | null>;
  refreshProjects: () => Promise<void>;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  invoices: Invoice[];
  invoicesLoading: boolean;
  refreshInvoices: () => Promise<void>;
  payInvoice: (id: string, txHash: string) => Promise<{ paidTotal: number } | null>;
  lastPaidInvoiceId: string | null;
  lastPaidAmount: number | null;
  lastPaidTxHash: string | null;
  isTopUpModalOpen: boolean;
  setTopUpModalOpen: (open: boolean) => void;
  accountCredits: number;
  topUpProject: (projectId: string, amount: number, txHash: string) => Promise<void>;
  apiError: string | null;
  apiReady: boolean;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [lastPaidInvoiceId, setLastPaid] = useState<string | null>(null);
  const [lastPaidAmount, setLastPaidAmount] = useState<number | null>(null);
  const [lastPaidTxHash, setLastPaidTxHash] = useState<string | null>(null);
  const [isTopUpModalOpen, setTopUpModalOpen] = useState(false);
  const [accountCredits, setAccountCredits] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiReady, setApiReady] = useState(false);

  const refreshProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const data = await api.fetchProjects();
      setProjects(data.projects);
      setAccountCredits(data.accountCredits);
      setApiError(null);
      setApiReady(true);
      setSelectedProjectId((prev) => {
        if (prev && data.projects.some((p) => p.id === prev)) return prev;
        return data.projects[0]?.id ?? "";
      });
      if (data.projects.length === 0) {
        toast.message("No projects in database — run: cd backend && npm run seed");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "API unavailable";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const refreshInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    try {
      const data = await api.fetchInvoices();
      setInvoices(data.invoices);
      setAccountCredits(data.accountCredits);
      setApiError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load invoices";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
    refreshInvoices();
  }, [refreshProjects, refreshInvoices]);

  const value = useMemo<Store>(() => ({
    role, setRole,
    projects,
    projectsLoading,
    addProject: async (body) => {
      try {
        const { project } = await api.createProject(body);
        await refreshProjects();
        setSelectedProjectId(project.id);
        return project;
      } catch {
        return null;
      }
    },
    refreshProjects,
    selectedProjectId, setSelectedProjectId,
    invoices,
    invoicesLoading,
    refreshInvoices,
    payInvoice: async (id, txHash) => {
      try {
        const result = await api.payInvoice({ invoiceId: id, txHash });
        setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Paid" as const } : i)));
        setAccountCredits(result.accountCredits);
        setLastPaid(id);
        setLastPaidAmount(result.paidTotal);
        setLastPaidTxHash(txHash);
        return { paidTotal: result.paidTotal };
      } catch {
        return null;
      }
    },
    lastPaidInvoiceId,
    lastPaidAmount,
    lastPaidTxHash,
    isTopUpModalOpen,
    setTopUpModalOpen,
    accountCredits,
    topUpProject: async (projectId, amount, txHash) => {
      const result = await api.topUpProject({ projectId, amount, txHash });
      setAccountCredits(result.accountCredits);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, totalSpend: p.totalSpend + result.credited, walletBalance: result.walletBalance }
            : p,
        ),
      );
    },
    apiError,
    apiReady,
  }), [role, projects, projectsLoading, selectedProjectId, invoices, invoicesLoading, lastPaidInvoiceId, lastPaidAmount, lastPaidTxHash, isTopUpModalOpen, accountCredits, refreshProjects, refreshInvoices, apiError, apiReady]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("StoreProvider missing");
  return v;
}