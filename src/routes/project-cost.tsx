import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore } from "@/lib/store";
import { useProjectDashboard } from "@/api/useProjectDashboard";
import { Search, Bell, Calendar, TrendingUp, ShieldCheck, FileText, Wallet, ExternalLink, CreditCard, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { FilterPanel } from "@/components/FilterPanel";
import { downloadCsv } from "@/lib/csv-export";
import { toast } from "sonner";

export const Route = createFileRoute("/project-cost")({ component: ProjectCostPage });

const STATUS_OPTS = [
  { key: "VERIFIED", label: "Verified" },
  { key: "PENDING", label: "Pending" },
  { key: "FAILED", label: "Failed" },
];

function ProjectCostPage() {
  const navigate = useNavigate();
  const { projects, selectedProjectId, setTopUpModalOpen } = useStore();
  const project = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const { data: dash, loading } = useProjectDashboard(project?.id);
  const [query, setQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  if (!project || loading) {
    return (
      <Layout>
        <div className="page-container flex items-center justify-center min-h-[40vh] text-muted-foreground">Loading project cost…</div>
      </Layout>
    );
  }

  const rows = (dash?.proofs ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    req: project.owner,
    date: p.date,
    status: p.status,
    cost: parseFloat(p.amount.replace(/[^0-9.]/g, "")) || 0,
    ticker: p.ticker,
  }));

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter((r) => {
      const matchQ = !q || r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.ticker.toLowerCase().includes(q);
      const matchStatus = statusFilters.length === 0 || statusFilters.includes(r.status);
      return matchQ && matchStatus;
    });
  }, [rows, query, statusFilters]);

  const totalCost = filtered.reduce((s, r) => s + r.cost, 0);

  const exportCsv = () => {
    downloadCsv(
      `project-cost-${project.id}.csv`,
      ["ID", "Item", "Requested By", "Date", "Status", "Cost USD", "Ticker"],
      filtered.map((r) => [r.id, r.name, r.req, r.date, r.status, r.cost, r.ticker]),
    );
    toast.success("Cost records exported");
  };

  return (
    <Layout>
      <div className="page-container">
        <header className="page-header">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 panel flex items-center justify-center"><CreditCard className="w-5 h-5 text-neon" /></div>
            <div>
              <h1 className="page-title">Project Cost</h1>
              <p className="text-sm text-muted-foreground">Project: {project.name}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search records…" className="panel pl-9 pr-4 py-2.5 text-sm w-full sm:w-72 outline-none focus:border-neon/50 transition" />
            </div>
            <button type="button" className="w-10 h-10 panel flex items-center justify-center hover:border-neon/40 transition shrink-0"><Bell className="w-4 h-4" /></button>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <Metric icon={<Calendar className="w-5 h-5 text-neon" />} label="TOTAL PROOFS" value={String(rows.length)} badge={`$${totalCost.toLocaleString()} filtered`} badgeTone="neon" />
          <Metric icon={<TrendingUp className="w-5 h-5 text-neon" />} label="VERIFIED" value={String(rows.filter((r) => r.status === "VERIFIED").length)} badge="On-chain attested" badgeTone="neutral" />
          <Metric icon={<ShieldCheck className="w-5 h-5 text-neon" />} label="AVG. COST/PROOF" value={`$${rows.length ? (totalCost / filtered.length || 0).toFixed(2) : "0"}`} badge="Per attestation" badgeTone="neutral" />
          <Metric icon={<FileText className="w-5 h-5 text-neon" />} label="PENDING / FAILED" value={String(rows.filter((r) => r.status !== "VERIFIED").length)} badge="Needs action" badgeTone="red" />
        </div>

        <div className="panel p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold">Proof Cost Breakdown</h2>
              <p className="text-xs text-muted-foreground mt-1">Attestation costs tied to {meta.assetUnit}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterPanel title="Status" options={STATUS_OPTS} selected={statusFilters} onChange={setStatusFilters} />
              <button type="button" onClick={exportCsv} className="panel px-3 py-1.5 text-xs flex items-center gap-2 hover:border-neon/40">
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-[10px] tracking-widest text-muted-foreground border-b border-border">
                <th className="text-left font-medium pb-3 pl-2">ID</th>
                <th className="text-left font-medium pb-3">ITEM NAME</th>
                <th className="text-left font-medium pb-3">REQUESTED BY</th>
                <th className="text-left font-medium pb-3">DATE</th>
                <th className="text-left font-medium pb-3">STATUS</th>
                <th className="text-right font-medium pb-3 pr-2">COST</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/60 hover:bg-secondary/30 transition">
                  <td className="py-4 pl-2 text-sm text-muted-foreground">{p.id}</td>
                  <td className="font-bold">{p.name}</td>
                  <td><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-neon text-black text-[10px] font-bold flex items-center justify-center">{p.req[0]}</div><span className="text-sm">{p.req}</span></div></td>
                  <td className="text-sm">{p.date}</td>
                  <td><StatusTag status={p.status} /></td>
                  <td className="text-right pr-2 font-bold text-neon">${p.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No records match filters.</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center">
          <button
            type="button"
            onClick={() => setTopUpModalOpen(true)}
            className="bg-neon text-black px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-neon hover:scale-[1.02] transition"
          >
            <Wallet className="w-4 h-4" /> TOP-UP BALANCE
          </button>
          <button type="button" onClick={() => navigate({ to: "/billing" })} className="panel px-8 py-3 font-bold flex items-center justify-center gap-2 hover:border-neon/30 transition">
            View Invoices <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Layout>
  );
}

function Metric({ icon, label, value, badge, badgeTone }: { icon: React.ReactNode; label: string; value: string; badge: string; badgeTone: "neon"|"red"|"neutral" }) {
  const cls = badgeTone === "neon" ? "bg-neon/15 text-neon border-neon/30" : badgeTone === "red" ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-secondary text-muted-foreground border-border";
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 panel flex items-center justify-center">{icon}</div>
        <span className={cn("text-[10px] px-2 py-1 rounded-full border font-bold", cls)}>{badge}</span>
      </div>
      <div className="text-[10px] tracking-widest text-muted-foreground mt-5">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    VERIFIED: "bg-neon/15 text-neon border-neon/30",
    PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    FAILED: "bg-red-500/15 text-red-400 border-red-500/30",
    Completed: "bg-neon/15 text-neon border-neon/30",
    "In Review": "bg-amber-500/15 text-amber-400 border-amber-500/30",
    Refunded: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return <span className={cn("px-3 py-0.5 text-[11px] font-bold rounded-full border", map[status] ?? map.PENDING)}>{status}</span>;
}
