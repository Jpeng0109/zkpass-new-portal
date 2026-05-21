import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, PROOF_TYPES, ProofType } from "@/lib/store";
import { Plus, ExternalLink, Wallet, CreditCard, ShieldCheck, MoreVertical, Copy, Search, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FilterPanel, FilterChip } from "@/components/FilterPanel";
import { downloadCsv } from "@/lib/csv-export";

export const Route = createFileRoute("/projects")({ component: ProjectsPage });

function ProjectsPage() {
  const { projects, addProject, setSelectedProjectId, setTopUpModalOpen, accountCredits, projectsLoading, apiError } = useStore();
  const totalProofs = projects.reduce((s, p) => s + (p.proofAmount || 0), 0);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [templateFilters, setTemplateFilters] = useState<string[]>([]);

  const STATUS_OPTS = [
    { key: "Active", label: "Active" },
    { key: "Paused", label: "Paused" },
    { key: "Review", label: "Review" },
  ];
  const TEMPLATE_OPTS = (Object.keys(PROOF_TYPES) as ProofType[]).map((k) => ({ key: k, label: PROOF_TYPES[k] }));

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return projects.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.appId.toLowerCase().includes(q) ||
        PROOF_TYPES[p.proofType].toLowerCase().includes(q);
      const matchStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
      const matchTemplate = templateFilters.length === 0 || templateFilters.includes(p.proofType);
      return matchQ && matchStatus && matchTemplate;
    });
  }, [projects, query, statusFilters, templateFilters]);

  const exportProjectsCsv = () => {
    downloadCsv(
      `projects-${new Date().toISOString().slice(0, 10)}.csv`,
      ["ID", "Name", "Owner", "Status", "Template", "Total Spend", "Proof Amount", "App ID"],
      filtered.map((p) => [p.id, p.name, p.owner, p.status, PROOF_TYPES[p.proofType], p.totalSpend, p.proofAmount, p.appId]),
    );
    toast.success("Projects CSV exported");
  };

  const goDashboard = (id: string) => {
    setSelectedProjectId(id);
    navigate({ to: "/dashboard" });
  };

  return (
    <Layout>
      <div className="page-container">
        <header className="page-header">
          <div>
            <h1 className="page-title">Project Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage and monitor your secure proof environments.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button type="button" className="panel px-4 py-2.5 text-sm flex items-center justify-center gap-2 hover:border-neon/40 transition">
              <ExternalLink className="w-4 h-4" /> Developer API
            </button>
            <button type="button" onClick={() => setOpen(true)} className="bg-neon text-black px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-neon hover:scale-[1.02] transition">
              <Plus className="w-4 h-4" /> Create Project
            </button>
          </div>
        </header>

        {apiError && (
          <div className="panel border-red-500/40 bg-red-500/10 p-4 mb-4 text-sm text-red-300">
            API: {apiError} — start backend with <code className="text-neon">cd backend && npm run dev</code>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard label="TOTAL PROJECTS" value={projectsLoading ? "…" : String(projects.length)} />
          <StatCard label="ACTIVE VERIFICATIONS" value={projectsLoading ? "…" : totalProofs.toLocaleString()} />
          <StatCard label="REMAINING CREDITS" value={`$${accountCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
          <StatCard label="TOTAL PROOF SPEND" value={projectsLoading ? "…" : `$${projects.reduce((s, p) => s + p.totalSpend, 0).toLocaleString()}`} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-lg sm:text-xl font-bold">Active Projects</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects..." className="panel pl-9 pr-4 py-2 text-sm w-full sm:w-64 outline-none focus:border-neon/50 transition" />
            </div>
            <FilterPanel title="Status" options={STATUS_OPTS} selected={statusFilters} onChange={setStatusFilters} />
            <FilterPanel title="Template" options={TEMPLATE_OPTS} selected={templateFilters} onChange={setTemplateFilters} />
            <button type="button" onClick={exportProjectsCsv} className="panel px-3 py-2 text-sm flex items-center gap-2 shrink-0 hover:border-neon/40">
              <Download className="w-3 h-3" /> CSV
            </button>
          </div>
        </div>
        {(statusFilters.length > 0 || templateFilters.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {statusFilters.map((s) => (
              <FilterChip key={s} label={s} onRemove={() => setStatusFilters((f) => f.filter((x) => x !== s))} />
            ))}
            {templateFilters.map((t) => (
              <FilterChip key={t} label={PROOF_TYPES[t as ProofType]} onRemove={() => setTemplateFilters((f) => f.filter((x) => x !== t))} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((p) => (
            <div key={p.id} className="panel p-5 hover:border-neon/40 transition-all duration-200">
              <button
                type="button"
                onClick={() => goDashboard(p.id)}
                className="w-full text-left rounded-lg -m-1 p-1 hover:bg-secondary/30 transition group/card cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="font-bold text-lg group-hover/card:text-neon transition truncate">{p.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-muted-foreground group-hover/card:text-foreground transition">Owned by {p.owner}</span>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-muted-foreground shrink-0 pointer-events-none" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div>
                    <div className="text-[10px] tracking-widest text-muted-foreground">TOTAL SPEND</div>
                    <div className="font-bold mt-1">${p.totalSpend.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-widest text-muted-foreground">PROOF AMOUNT</div>
                    <div className="font-bold mt-1 text-neon">{p.proofAmount.toLocaleString()}</div>
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <span>APP ID: {p.appId.slice(0, 7)}*****</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.appId); toast.success("App ID copied"); }} className="hover:text-neon"><Copy className="w-3 h-3" /></button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Template: <span className="text-foreground/80">{PROOF_TYPES[p.proofType]}</span></div>
              <div className="flex gap-2 mt-4">
                <ActionBtn
                  icon={<Wallet className="w-3 h-3" />}
                  label="Top-up"
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setTopUpModalOpen(true);
                  }}
                />
                <ActionBtn icon={<CreditCard className="w-3 h-3" />} label="Billing" onClick={() => { setSelectedProjectId(p.id); navigate({ to: "/project-cost" }); }} />
                <ActionBtn icon={<ShieldCheck className="w-3 h-3" />} label="Proofs" onClick={() => { setSelectedProjectId(p.id); navigate({ to: "/proofs" }); }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <CreateProjectModal
          onClose={() => setOpen(false)}
          onSave={async (body) => {
            const created = await addProject(body);
            setOpen(false);
            if (created) toast.success("Project created");
            else toast.error("Failed to create project — is the API running?");
          }}
        />
      )}
    </Layout>
  );
}

function StatCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="panel p-5">
      <div className="text-[10px] tracking-widest text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-2 mt-2">
        <div className="text-2xl font-bold">{value}</div>
        {delta && <span className="text-xs text-neon">{delta}</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-neon/20 text-neon border-neon/30",
    Paused: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    Review: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  return <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded border", map[status])}>{status}</span>;
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex-1 flex items-center justify-center gap-1.5 panel py-2 text-xs hover:bg-secondary hover:border-neon/30 transition">
      {icon} {label}
    </button>
  );
}

function CreateProjectModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (body: { name: string; owner: string; templateType: ProofType; initialTopUp?: number }) => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProofType | "">("");
  const [owner, setOwner] = useState("");
  const [billing, setBilling] = useState("");
  const [topup, setTopup] = useState("");

  const submit = () => {
    if (!name || !type || !owner) { toast.error("Fill required fields"); return; }
    onSave({
      name,
      owner,
      templateType: type,
      initialTopUp: Number(topup) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="panel p-8 w-full max-w-xl animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold">Create New Project</h2>
        <p className="text-sm text-muted-foreground mt-1">Set up a secure, stock-proof environment for your zk-assertions.</p>
        <div className="mt-6 space-y-4">
          <Field label="Project Name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Financial Audit 2024" className="w-full bg-input border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-neon/50 transition" />
          </Field>
          <Field label="Verification Template (ZK-Proof Type) *">
            <select value={type} onChange={(e) => setType(e.target.value as ProofType)} className="w-full bg-input border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-neon/50 transition">
              <option value="">Select template…</option>
              {(Object.keys(PROOF_TYPES) as ProofType[]).map((k) => (<option key={k} value={k}>{PROOF_TYPES[k]}</option>))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Project Owner">
              <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Owner name" className="w-full bg-input border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-neon/50 transition" />
            </Field>
            <Field label="Billing Account">
              <input value={billing} onChange={(e) => setBilling(e.target.value)} placeholder="Select account" className="w-full bg-input border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-neon/50 transition" />
            </Field>
          </div>
          <Field label="Initial Top-up Amount (Optional)">
            <input value={topup} onChange={(e) => setTopup(e.target.value)} placeholder="$ 0.00" className="w-full bg-input border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-neon/50 transition" />
          </Field>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 panel py-3 font-semibold hover:bg-secondary transition">Cancel</button>
          <button onClick={submit} className="flex-1 bg-neon text-black py-3 rounded-lg font-bold shadow-neon hover:scale-[1.02] transition">Save Project</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      {children}
    </div>
  );
}