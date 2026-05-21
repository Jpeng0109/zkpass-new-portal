import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, Invoice } from "@/lib/store";
import { useState, useMemo } from "react";
import { Search, Download, CheckCircle2, Calendar, Clock, FileText, X, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterPanel, FilterChip } from "@/components/FilterPanel";
import { downloadCsv } from "@/lib/csv-export";
import { ZkPassLogo } from "@/components/ZkPassLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/billing")({ component: BillingPage });

const STATUS_FILTERS = [
  { key: "Paid", label: "Paid" },
  { key: "Unpaid", label: "Unpaid" },
  { key: "Overdue", label: "Overdue" },
];

function BillingPage() {
  const { invoices, invoicesLoading, apiError } = useStore();
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [range, setRange] = useState<"all" | "30" | "q">("all");
  const [query, setQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  const filteredInvoices = useMemo(() => {
    const q = query.toLowerCase().trim();
    return invoices.filter((inv) => {
      const matchQ = !q || inv.id.toLowerCase().includes(q) || inv.issued.toLowerCase().includes(q) || inv.due.toLowerCase().includes(q);
      const matchStatus = statusFilters.length === 0 || statusFilters.includes(inv.status);
      const matchRange =
        range === "all" ||
        (range === "30" && /2024|2023/.test(inv.issued)) ||
        (range === "q" && /Jan|Feb|Mar|Oct|Nov|Dec/.test(inv.issued));
      return matchQ && matchStatus && matchRange;
    });
  }, [invoices, query, statusFilters, range]);

  const totalPaid = useMemo(() => invoices.filter(i => i.status === "Paid").reduce((s,i)=>s+i.amount,0), [invoices]);
  const outstanding = useMemo(() => invoices.filter(i => i.status === "Unpaid" || i.status === "Overdue").reduce((s,i)=>s+i.amount,0), [invoices]);
  const nextDue = invoices.filter(i => i.status !== "Paid")[0]?.due ?? "—";

  const exportCsv = () => {
    downloadCsv(
      `invoices-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Invoice ID", "Issued", "Amount", "Status", "Due Date"],
      filteredInvoices.map((i) => [i.id, i.issued, i.amount, i.status, i.due]),
    );
    toast.success("Invoice CSV exported");
  };

  return (
    <Layout>
      <div className="page-container">
        {apiError && (
          <div className="panel border-red-500/40 bg-red-500/10 p-4 mb-4 text-sm text-red-300">
            API: {apiError}
          </div>
        )}

        <header className="page-header">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 panel flex items-center justify-center"><CreditCard className="w-5 h-5 text-neon" /></div>
            <div>
              <h1 className="page-title">Billing & Invoices</h1>
              <p className="text-sm text-muted-foreground">Project: Stellar Cloud Migrations</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search invoice ID, date…" className="panel pl-9 pr-4 py-2.5 text-sm w-full sm:w-72 outline-none focus:border-neon/50 transition" />
            </div>
            <button type="button" onClick={exportCsv} className="panel px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:border-neon/40 transition">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <BigCard icon={<CheckCircle2 className="w-5 h-5 text-neon" />} label="TOTAL PAID" value={`$${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} badge="+12% vs last month" />
          <BigCard icon={<Clock className="w-5 h-5 text-amber-400" />} label="OUTSTANDING" value={`$${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
          <BigCard icon={<Calendar className="w-5 h-5 text-neon" />} label="NEXT DUE DATE" value={nextDue} />
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">Invoice History</h2>
              <span className="px-2 py-0.5 text-[10px] rounded-md bg-neon/15 text-neon border border-neon/30 font-bold">
                {invoicesLoading ? "…" : `${invoices.length} Total`}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="panel p-1 flex">
                {[{ k: "all", l: "All Time" }, { k: "30", l: "30 Days" }, { k: "q", l: "This Quarter" }].map(t => (
                  <button key={t.k} onClick={() => setRange(t.k as any)} className={cn("px-3 py-1.5 text-xs font-semibold rounded-md transition", range === t.k ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}>{t.l}</button>
                ))}
              </div>
              <FilterPanel title="Status" options={STATUS_FILTERS} selected={statusFilters} onChange={setStatusFilters} />
            </div>
          </div>
          {statusFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {statusFilters.map((s) => (
                <FilterChip key={s} label={s} onRemove={() => setStatusFilters((f) => f.filter((x) => x !== s))} />
              ))}
            </div>
          )}

          <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-[10px] tracking-widest text-muted-foreground border-b border-border">
                <th className="text-left font-medium pb-3 pl-2">INVOICE ID</th>
                <th className="text-left font-medium pb-3">ISSUE DATE</th>
                <th className="text-left font-medium pb-3">AMOUNT</th>
                <th className="text-left font-medium pb-3">STATUS</th>
                <th className="text-left font-medium pb-3">DUE DATE</th>
                <th className="text-right font-medium pb-3 pr-2">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => {
                const clickable = inv.status === "Unpaid" || inv.status === "Overdue";
                return (
                  <tr key={inv.id} onClick={() => clickable && setSelected(inv)} className={cn("border-b border-border/60 transition", clickable && "cursor-pointer hover:bg-secondary/40")}>
                    <td className="py-4 pl-2"><span className="flex items-center gap-2 font-bold"><FileText className="w-3.5 h-3.5 text-muted-foreground" /> {inv.id}</span></td>
                    <td className="text-sm">{inv.issued}</td>
                    <td className="font-bold">${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td><InvoiceStatus status={inv.status} /></td>
                    <td className="text-sm">{inv.due}</td>
                    <td className="pr-2 text-right text-xs text-muted-foreground">{clickable ? "View →" : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 text-xs">
          <span className="flex items-center gap-2 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" /> All systems operational • Last sync: 2 mins ago</span>
          <div className="flex gap-6 text-muted-foreground">
            <a className="hover:text-foreground" href="#">PRIVACY POLICY</a>
            <a className="hover:text-foreground" href="#">SUPPORT CENTER</a>
            <a className="hover:text-foreground" href="#">DOCUMENTATION</a>
          </div>
        </div>
      </div>

      {selected && <InvoiceDrawer invoice={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}

function BigCard({ icon, label, value, badge }: { icon: React.ReactNode; label: string; value: string; badge?: string }) {
  return (
    <div className="panel p-6 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-neon/5 blur-2xl rounded-full" />
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 panel flex items-center justify-center">{icon}</div>
        {badge && <span className="text-[10px] px-2 py-1 rounded-full bg-neon/15 text-neon border border-neon/30 font-bold">{badge}</span>}
      </div>
      <div className="text-[10px] tracking-widest text-muted-foreground mt-6">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

function InvoiceStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: "bg-neon/15 text-neon border-neon/30",
    Unpaid: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    Overdue: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return <span className={cn("px-3 py-0.5 text-[11px] font-bold rounded-full border", map[status])}>{status}</span>;
}

function InvoiceDrawer({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const navigate = useNavigate();
  const lines =
    invoice.lineItems && invoice.lineItems.length > 0
      ? invoice.lineItems.map((l) => ({ name: l.name, id: l.lineId, amount: l.amount }))
      : [
          { name: "Platform Services", id: "PF-9910", amount: invoice.amount * 0.6 },
          { name: "Verification Usage", id: "PF-9911", amount: invoice.amount * 0.4 },
        ];
  const tax = invoice.amount * 0.15;
  const total = invoice.amount + tax;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 bottom-0 w-full sm:w-[min(100%,480px)] bg-card border-l border-border p-5 sm:p-8 overflow-y-auto animate-in slide-in-from-right duration-300 neon-glow-bg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <ZkPassLogo size="sm" />
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <h2 className="text-3xl font-bold mt-6">Billing Overview</h2>
        <p className="text-sm text-muted-foreground mt-2">Viewing line items and payment status for Project: Stellar Cloud Migrations</p>

        <div className="panel p-5 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-widest text-muted-foreground">INVOICE ID</span>
            <InvoiceStatus status={invoice.status} />
          </div>
          <div className="text-2xl font-bold mt-2">{invoice.id}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="panel p-4">
            <div className="text-xs text-muted-foreground">Issued Date</div>
            <div className="font-bold mt-1">{invoice.issued}</div>
          </div>
          <div className="panel p-4">
            <div className="text-xs text-muted-foreground">Due Date</div>
            <div className="font-bold mt-1">{invoice.due}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 text-neon font-bold text-sm"><FileText className="w-4 h-4" /> DETAILED LINE ITEMS</div>
        <div className="space-y-3 mt-3">
          {lines.map(l => (
            <div key={l.id} className="flex items-center justify-between panel p-4">
              <div>
                <div className="font-bold">{l.name}</div>
                <div className="text-xs text-muted-foreground">ID: {l.id}</div>
              </div>
              <div className="font-bold">${l.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          ))}
        </div>

        <div className="panel p-5 mt-6">
          <Row k="Subtotal" v={`$${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
          <Row k="Estimated Tax (15%)" v={`$${tax.toFixed(3)}`} />
          <div className="border-t border-border my-3" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">Total Amount</span>
            <span className="text-neon font-bold text-lg">${total.toFixed(3)}</span>
          </div>
          <button
            onClick={() => {
              onClose();
              navigate({
                to: "/payment",
                search: { type: "invoice", amount: total, invoiceId: invoice.id },
              });
            }}
            className="w-full bg-neon text-black py-3 rounded-lg font-bold mt-4 shadow-neon hover:scale-[1.01] transition flex items-center justify-center gap-2"
          >
            Pay Now →
          </button>
          <button className="w-full panel py-3 font-semibold mt-2 flex items-center justify-center gap-2 hover:border-neon/30 transition">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between py-1.5 text-sm"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>;
}