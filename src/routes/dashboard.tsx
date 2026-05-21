import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, PROOF_TYPES, TEMPLATE_META, ProofRecord, getTemplateType } from "@/lib/store";
import { useProjectDashboard } from "@/api/useProjectDashboard";
import { useEffect, useMemo, useState } from "react";
import {
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from "recharts";
import { Search, Download, CheckCircle2, AlertCircle, Clock, Copy, ShieldAlert, FileText, ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { downloadProjectReport } from "@/lib/report-export";
import { downloadProofCertificate } from "@/lib/certificate-export";
import { FilterPanel, FilterChip } from "@/components/FilterPanel";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

type ProofStatus = "VERIFIED" | "PENDING" | "FAILED";

function DashboardPage() {
  const { projects, selectedProjectId, projectsLoading, apiError, refreshProjects, apiReady } = useStore();
  const project = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const { data: dash, loading: dashLoading, error: dashError, refresh: refreshDashboard } = useProjectDashboard(project?.id);
  const templateType = project ? getTemplateType(project) : "ASSET_SOLVENCY";
  const staticMeta = TEMPLATE_META[templateType];
  const meta = dash?.meta
    ? { ...staticMeta, ...dash.meta, metricTitles: dash.meta.metricTitles as typeof staticMeta.metricTitles, metricValues: dash.meta.metricValues as typeof staticMeta.metricValues }
    : staticMeta;
  const chartData = dash?.chartSeries ?? [];
  const proofs = dash?.proofs ?? [];
  const data = chartData;

  const [selectedProof, setSelectedProof] = useState<ProofRecord | null>(null);
  const [tab, setTab] = useState<"all" | "verified" | "pending">("all");
  const [headerQuery, setHeaderQuery] = useState("");
  const [proofQuery, setProofQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  useEffect(() => {
    if (proofs[0]) setSelectedProof(proofs[0]);
  }, [templateType, selectedProjectId, proofs]);

  if (projectsLoading) {
    return (
      <Layout>
        <div className="page-container flex flex-col items-center justify-center min-h-[40vh] gap-3 text-muted-foreground">
          <p>Loading projects…</p>
          <p className="text-xs text-center max-w-md">
            First load from Render can take up to 60s (free tier cold start).
          </p>
        </div>
      </Layout>
    );
  }

  if (apiError || !apiReady) {
    return (
      <Layout>
        <div className="page-container flex flex-col items-center justify-center min-h-[40vh] gap-4 max-w-lg mx-auto text-center">
          <p className="text-red-300 text-sm">API: {apiError ?? "Could not load projects"}</p>
          <p className="text-xs text-muted-foreground">
            Check Render <code className="text-neon">CLIENT_ORIGIN</code> includes your Vercel URL and{" "}
            <code className="text-neon">VITE_API_BASE_URL</code> ends with <code className="text-neon">/api/v1</code>.
          </p>
          <button
            type="button"
            onClick={() => refreshProjects()}
            className="bg-neon text-black px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="page-container flex flex-col items-center justify-center min-h-[40vh] gap-3 text-muted-foreground text-center">
          <p>No projects in the database.</p>
          <p className="text-xs">Run seed: <code className="text-neon">cd backend && npm run seed</code></p>
        </div>
      </Layout>
    );
  }

  if (dashLoading || !selectedProof) {
    return (
      <Layout>
        <div className="page-container flex flex-col items-center justify-center min-h-[40vh] gap-3 text-muted-foreground">
          {dashError ? (
            <>
              <p className="text-red-300 text-sm">Dashboard: {dashError}</p>
              <button
                type="button"
                onClick={() => refreshDashboard()}
                className="bg-neon text-black px-5 py-2.5 rounded-lg text-sm font-semibold"
              >
                Retry
              </button>
            </>
          ) : (
            <p>Loading dashboard…</p>
          )}
        </div>
      </Layout>
    );
  }

  const STATUS_OPTS = [
    { key: "VERIFIED", label: "Verified" },
    { key: "PENDING", label: "Pending" },
    { key: "FAILED", label: "Failed" },
  ];

  const filtered = proofs.filter((p) => {
    const matchTab = tab === "all" || p.status.toLowerCase() === tab;
    const matchStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
    const q = (proofQuery || headerQuery).toLowerCase().trim();
    const matchQ =
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.ticker.toLowerCase().includes(q) ||
      p.txHash.toLowerCase().includes(q) ||
      p.amount.toLowerCase().includes(q);
    return matchTab && matchStatus && matchQ;
  });

  const handleExport = () => {
    downloadProjectReport(project, proofs);
    toast.success(`Report exported for ${project.name}`);
  };

  return (
    <Layout>
      <div className="page-container">
        {apiError && (
          <div className="panel border-red-500/40 bg-red-500/10 p-4 mb-4 text-sm text-red-300">API: {apiError}</div>
        )}

        <header className="page-header">
          <div className="min-w-0">
            <h1 className="page-title">{meta.pageTitle}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-neon" /> Active Project
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">{project.name}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-foreground/70">{PROOF_TYPES[templateType]}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={headerQuery}
                onChange={(e) => setHeaderQuery(e.target.value)}
                placeholder="Search hash, ID, or amount…"
                className="panel pl-9 pr-4 py-2.5 text-sm w-full sm:w-80 outline-none focus:border-neon/50 transition"
              />
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="panel px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:border-neon/40 transition shrink-0"
            >
              <Download className="w-4 h-4" /> EXPORT REPORT
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:space-y-3">
            {meta.metricTitles.map((title, i) => (
              <div key={title} className={cn("panel p-4 transition-all", i === 0 && "border-neon/40 bg-neon/5")}>
                <div className="text-[10px] tracking-widest text-muted-foreground">{title}</div>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <div className={cn("font-bold", i === 0 ? "text-base text-neon" : "text-xl")}>{meta.metricValues[i]}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 panel p-4 sm:p-5 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  {meta.chartTitle} <span className="text-neon">↗</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{meta.chartSubtitle}</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-neon/15 text-neon border border-neon/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" /> Live Updates
              </span>
            </div>
            <div className="h-48 sm:h-64 mt-4 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                {meta.chartType === "bar" ? (
                  <BarChart data={data}>
                    <CartesianGrid stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="t" stroke="#ffffff60" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff60" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff20", borderRadius: 8 }} />
                    <Bar dataKey="a" fill="#9eff00" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="b" fill="#ffffff40" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#9eff00" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#9eff00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="t" stroke="#ffffff60" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff60" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff20", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="a" stroke="#9eff00" strokeWidth={2} fill="url(#g1)" />
                    <Line type="monotone" dataKey="b" stroke="#ffffff" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 mt-6 sm:mt-8">
          <div className="xl:col-span-2 order-2 xl:order-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="panel p-1 flex flex-wrap">
                {(["all", "verified", "pending"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-semibold rounded-md capitalize transition",
                      tab === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t === "all" ? "All Proofs" : t}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={proofQuery}
                  onChange={(e) => setProofQuery(e.target.value)}
                  placeholder="Search Asset ID…"
                  className="panel pl-9 pr-4 py-2 text-sm w-full sm:w-64 outline-none focus:border-neon/50 transition"
                />
              </div>
              <FilterPanel title="Status" options={STATUS_OPTS} selected={statusFilters} onChange={setStatusFilters} />
            </div>
            {statusFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {statusFilters.map((s) => (
                  <FilterChip key={s} label={s} onRemove={() => setStatusFilters((f) => f.filter((x) => x !== s))} />
                ))}
              </div>
            )}
            <div className="space-y-3">
              {filtered.map((p) => {
                const active = selectedProof.id === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setSelectedProof(p)}
                    className={cn(
                      "w-full panel p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-all duration-200 text-left",
                      active && p.status === "FAILED" && "bg-red-500/15 border-red-500/50",
                      active && p.status !== "FAILED" && "bg-neon/15 border-neon/40",
                      !active && "hover:border-neon/30",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-md flex items-center justify-center font-bold",
                        active && p.status !== "FAILED" ? "bg-black/30 text-foreground" : "bg-secondary text-foreground",
                      )}
                    >
                      {p.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className={cn("font-semibold", active && p.status !== "FAILED" && "text-foreground")}>{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.ticker}</div>
                    </div>
                    <div className="text-sm font-semibold sm:w-36 sm:text-right">
                      {p.amount}{" "}
                      <span className="text-muted-foreground font-normal text-[10px] block">{meta.assetUnit}</span>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 w-full sm:w-auto">
                      <StatusPill status={p.status} />
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {p.date}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border text-xs text-muted-foreground">
              <span>
                Showing {filtered.length} of {proofs.length} entries
              </span>
              <div className="flex items-center gap-2">
                <span>Previous</span>
                <button className="w-7 h-7 rounded bg-neon text-black font-bold">1</button>
                <button className="w-7 h-7 rounded hover:bg-secondary">2</button>
                <button className="w-7 h-7 rounded hover:bg-secondary">3</button>
                <span>Next</span>
              </div>
            </div>
          </div>

          <div className="order-1 xl:order-2">
            <DetailPanel proof={selectedProof} meta={meta} project={project} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatusPill({ status }: { status: ProofStatus }) {
  const map = {
    VERIFIED: { cls: "bg-neon/15 text-neon border-neon/30", icon: <CheckCircle2 className="w-3 h-3" /> },
    PENDING: { cls: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: <Clock className="w-3 h-3" /> },
    FAILED: { cls: "bg-red-500/15 text-red-400 border-red-500/30", icon: <AlertCircle className="w-3 h-3" /> },
  } as const;
  const m = map[status];
  return (
    <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full border flex items-center gap-1", m.cls)}>
      {m.icon} {status}
    </span>
  );
}

function DetailPanel({ proof, meta, project }: { proof: ProofRecord; meta: TemplateMeta; project: Project }) {
  const failed = proof.status === "FAILED";
  const shortTx = `${proof.txHash.slice(0, 8)}…${proof.txHash.slice(-6)}`;
  const shortMerkle = `${proof.merkleRoot.slice(0, 8)}…${proof.merkleRoot.slice(-6)}`;

  return (
    <div className={cn("panel p-6 relative overflow-hidden transition-all duration-300", failed && "border-red-500/40")}>
      <div className={cn("absolute top-0 left-0 right-0 h-1", failed ? "bg-red-500" : "bg-neon")} />
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold">{proof.name}</h3>
          <p className="text-sm text-muted-foreground">
            {proof.id} · {proof.ticker} · {meta.assetUnit}
          </p>
        </div>
        <StatusPill status={proof.status} />
      </div>

      {failed ? (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/40 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <ShieldAlert className="w-4 h-4" /> ZK-Proof Verification Failure
          </div>
          <p className="text-xs text-red-300/80 mt-2">
            Merkle root hash mismatch detected. The reported {meta.assetUnit.toLowerCase()} could not be cryptographically
            attested against the {meta.protocol} registry. Review failure logs for the full trace.
          </p>
        </div>
      ) : null}

      <div className="mt-5 p-3 rounded-lg bg-secondary/40 border border-border">
        <div className="text-[10px] tracking-widest text-muted-foreground mb-2">TEMPLATE CONFIGURATION</div>
        <div className="grid grid-cols-2 gap-2">
          {meta.metricTitles.map((t, i) => (
            <div key={t}>
              <div className="text-[9px] tracking-widest text-muted-foreground">{t}</div>
              <div className="text-[11px] font-semibold truncate">{meta.metricValues[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <DetailRow label="TRANSACTION HASH" value={shortTx} fullValue={proof.txHash} copyable />
      <DetailRow label="MERKLE ROOT HASH" value={shortMerkle} fullValue={proof.merkleRoot} copyable />
      <DetailRow label="VERIFICATION PROTOCOL" value={meta.protocol} />
      <DetailRow label="LAST UPDATED" value={`${proof.date} • 14:32 UTC`} />

      <div className="mt-5">
        <div className="text-[10px] tracking-widest text-muted-foreground mb-2">SUPPORTING DOCUMENTS</div>
        <DocRow name="Reserve_Audit_Report.pdf" size="2.4 MB" disabled={failed} />
        <DocRow name="Ownership_Credential.json" size="12 KB" disabled={failed} />
      </div>

      <div className="mt-6 space-y-3">
        {failed ? (
          <button
            onClick={() => toast.success("Failure debug logs downloaded")}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition"
          >
            <Download className="w-4 h-4" /> Download Failure Debug Logs
          </button>
        ) : (
          <button
            onClick={() => toast.success("Re-verification triggered")}
            className="w-full bg-neon text-black py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-neon hover:scale-[1.01] transition"
          >
            <ShieldCheck className="w-4 h-4" /> Re-Verify Asset Proof
          </button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={failed}
            onClick={async () => {
              if (failed) return;
              await downloadProofCertificate({ project, proof, meta });
              toast.success(`Certificate downloaded for ${proof.name}`);
            }}
            className={cn(
              "panel py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition",
              failed ? "cursor-not-allowed opacity-40" : "hover:border-neon/30",
            )}
          >
            <Download className="w-3 h-3" /> Download Certificate
          </button>
          <button className="panel py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:border-neon/30 transition">
            <ExternalLink className="w-3 h-3" /> Explorer
          </button>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-border">
        <div className="text-[10px] tracking-widest text-muted-foreground mb-3">SECURITY</div>
        <button
          disabled={failed}
          className={cn(
            "flex items-center gap-2 text-sm font-semibold transition",
            failed ? "text-muted-foreground/50 cursor-not-allowed" : "text-red-400 hover:text-red-300",
          )}
        >
          <ShieldAlert className="w-4 h-4" /> Revoke this Proof
        </button>
        <p className="text-[11px] text-muted-foreground mt-2 italic">
          {failed
            ? "Revocation disabled — proof has not been issued successfully."
            : "* Revocation will append a nullifier to the on-chain registry, making this proof invalid for future verifications."}
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  fullValue,
  copyable,
}: {
  label: string;
  value: string;
  fullValue?: string;
  copyable?: boolean;
}) {
  return (
    <div className="mt-4">
      <div className="text-[10px] tracking-widest text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-mono">{value}</span>
        {copyable && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(fullValue || value);
              toast.success("Copied");
            }}
            className="text-muted-foreground hover:text-neon"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function DocRow({ name, size, disabled }: { name: string; size: string; disabled?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 panel p-3 mb-2 transition",
        disabled ? "opacity-40 cursor-not-allowed" : "hover:border-neon/30",
      )}
    >
      <FileText className="w-4 h-4 text-neon" />
      <div className="flex-1">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-[11px] text-muted-foreground">{size}</div>
      </div>
      <Download className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}
