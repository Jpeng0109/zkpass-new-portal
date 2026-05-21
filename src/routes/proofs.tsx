import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, PROOF_TYPES } from "@/lib/store";
import { useProjectDashboard } from "@/api/useProjectDashboard";
import { Search, Download, CheckCircle2, AlertCircle, Clock, ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { FilterPanel, FilterChip } from "@/components/FilterPanel";
import { downloadCsv } from "@/lib/csv-export";
import { toast } from "sonner";

export const Route = createFileRoute("/proofs")({ component: ProofsPage });

type Status = "VERIFIED" | "PENDING" | "FAILED";

const STATUS_OPTS = [
  { key: "VERIFIED", label: "Verified" },
  { key: "PENDING", label: "Pending" },
  { key: "FAILED", label: "Failed" },
];

function ProofsPage() {
  const navigate = useNavigate();
  const { projects, selectedProjectId, setSelectedProjectId } = useStore();
  const project = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const { data: dash, loading } = useProjectDashboard(project?.id);
  const [tab, setTab] = useState<"all" | "verified" | "pending" | "failed">("all");
  const [query, setQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  const proofs = dash?.proofs ?? [];

  if (!project || loading) {
    return (
      <Layout>
        <div className="page-container flex items-center justify-center min-h-[40vh] text-muted-foreground">Loading proofs…</div>
      </Layout>
    );
  }
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return proofs.filter((p) => {
      const matchTab = tab === "all" || p.status.toLowerCase() === tab;
      const matchStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.ticker.toLowerCase().includes(q) ||
        p.txHash.toLowerCase().includes(q);
      return matchTab && matchStatus && matchQ;
    });
  }, [proofs, tab, query, statusFilters]);

  const counts = {
    all: proofs.length,
    verified: proofs.filter((p) => p.status === "VERIFIED").length,
    pending: proofs.filter((p) => p.status === "PENDING").length,
    failed: proofs.filter((p) => p.status === "FAILED").length,
  };

  const exportCsv = () => {
    downloadCsv(
      `proofs-${project.id}-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Proof ID", "Asset", "Ticker", "Amount", "Status", "Date", "Tx Hash", "Merkle Root"],
      filtered.map((p) => [p.id, p.name, p.ticker, p.amount, p.status, p.date, p.txHash, p.merkleRoot]),
    );
    toast.success("Proofs CSV exported");
  };

  return (
    <Layout>
      <div className="page-container">
        <button type="button" onClick={() => navigate({ to: "/projects" })} className="text-xs text-muted-foreground hover:text-neon flex items-center gap-1 mb-4 transition">
          <ArrowLeft className="w-3 h-3" /> Back to Projects
        </button>
        <header className="page-header">
          <div>
            <h1 className="page-title">Proof List</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-neon" /> {project.name}</span>
              <span>•</span>
              <span>{PROOF_TYPES[project.proofType]}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              value={project.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="panel px-3 py-2.5 text-sm bg-card outline-none focus:border-neon/50 transition w-full sm:w-auto"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => navigate({ to: "/dashboard" })} className="bg-neon text-black px-4 py-2.5 rounded-lg text-sm font-semibold shadow-neon hover:scale-[1.02] transition">
              Open Dashboard
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {meta.metricTitles.map((t, i) => (
            <div key={t} className={cn("panel p-4", i === 0 && "border-neon/40 bg-neon/5")}>
              <div className="text-[10px] tracking-widest text-muted-foreground">{t}</div>
              <div className={cn("font-bold mt-1.5", i === 0 ? "text-neon text-sm" : "text-xl")}>{meta.metricValues[i]}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
          <div className="panel p-1 flex flex-wrap">
            {(["all", "verified", "pending", "failed"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md capitalize transition",
                  tab === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "all" ? "All" : t} <span className="ml-1 text-muted-foreground">{counts[t]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID, name or ticker…"
                className="panel pl-9 pr-4 py-2 text-sm w-full outline-none focus:border-neon/50 transition"
              />
            </div>
            <FilterPanel title="Status" options={STATUS_OPTS} selected={statusFilters} onChange={setStatusFilters} />
            <button type="button" onClick={exportCsv} className="panel px-4 py-2 text-sm flex items-center gap-2 hover:border-neon/40 transition shrink-0">
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>
        </div>

        <div className="panel overflow-hidden overflow-x-auto">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] tracking-widest text-muted-foreground border-b border-border bg-secondary/30 min-w-[720px]">
            <div className="col-span-2">PROOF ID</div>
            <div className="col-span-4">ASSET</div>
            <div className="col-span-2">REFERENCE</div>
            <div className="col-span-2 text-right">{meta.assetUnit.toUpperCase()}</div>
            <div className="col-span-2 text-right">STATUS</div>
          </div>
          {filtered.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => { setSelectedProjectId(project.id); navigate({ to: "/dashboard" }); }}
              className="w-full grid grid-cols-12 gap-4 px-5 py-4 border-b border-border last:border-b-0 hover:bg-secondary/40 transition text-left items-center min-w-[720px]"
            >
              <div className="col-span-2 font-mono text-xs">{p.id}</div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center font-bold text-xs">{p.name[0]}</div>
                <div>
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {p.date}</div>
                </div>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground">{p.ticker}</div>
              <div className="col-span-2 text-sm font-semibold text-right">{p.amount}</div>
              <div className="col-span-2 flex justify-end"><StatusPill status={p.status} /></div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">No proofs match the current filter.</div>
          )}
        </div>

        <div className="flex items-center justify-between mt-5 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {proofs.length} entries</span>
        </div>
      </div>
    </Layout>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map = {
    VERIFIED: { cls: "bg-neon/15 text-neon border-neon/30", icon: <CheckCircle2 className="w-3 h-3" /> },
    PENDING: { cls: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: <Clock className="w-3 h-3" /> },
    FAILED: { cls: "bg-red-500/15 text-red-400 border-red-500/30", icon: <AlertCircle className="w-3 h-3" /> },
  } as const;
  const m = map[status];
  return <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1", m.cls)}>{m.icon} {status}</span>;
}
