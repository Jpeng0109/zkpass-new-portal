import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, PROOF_TYPES } from "@/lib/store";
import { CheckCircle2, ArrowLeft, Download, Printer, ShieldCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
  type: z.enum(["invoice", "topup"]).default("invoice"),
  id: z.string().optional(),
  amount: z.coerce.number().optional(),
  projectId: z.string().optional(),
  txHash: z.string().optional(),
});

export const Route = createFileRoute("/receipt")({
  component: ReceiptPage,
  validateSearch: (s) => searchSchema.parse(s),
});

function ReceiptPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { invoices, lastPaidInvoiceId, lastPaidAmount, lastPaidTxHash, projects, accountCredits } = useStore();

  const isTopUp = search.type === "topup";
  const inv = !isTopUp ? invoices.find((i) => i.id === (search.id || lastPaidInvoiceId)) || invoices[1] : null;
  const project = projects.find((p) => p.id === search.projectId) || projects[0];

  const paidTotal = search.amount ?? lastPaidAmount ?? (isTopUp ? 0 : inv?.amount ?? 0);
  const tx = search.txHash ?? lastPaidTxHash ?? "—";
  const fee = paidTotal * 0.02;
  const proc = isTopUp ? 0 : 0.5;
  const totalDeducted = paidTotal + fee + proc;

  return (
    <Layout>
      <div className="page-container max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate({ to: isTopUp ? "/projects" : "/billing" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {isTopUp ? "Back to Projects" : "Back to Billing"}
        </button>

        <div className="panel p-6 sm:p-10 relative overflow-hidden neon-glow-bg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 panel flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="font-bold">Billing & Recharge</h2>
              <p className="text-xs text-muted-foreground">Transaction Confirmation</p>
            </div>
          </div>
          <div className="border-t border-border my-6" />

          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neon/15 border-2 border-neon flex items-center justify-center shadow-neon">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-neon" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-5">Transaction Successful</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md px-2">
              {isTopUp ? (
                <>
                  Top-up of <span className="text-neon font-bold">${paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>{" "}
                  credited to <span className="text-neon font-bold">{project.name}</span>. Your account balance has been updated.
                </>
              ) : (
                <>
                  Invoice <span className="text-neon font-bold">{inv?.id}</span> is now{" "}
                  <span className="text-neon font-bold">PAID</span>. Credits have been applied to your billing account.
                </>
              )}
            </p>
          </div>

          <div className="panel p-5 mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] tracking-widest text-muted-foreground">AMOUNT PAID</div>
                <div className="text-2xl font-bold mt-1">
                  ${paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-[10px] tracking-widest text-muted-foreground">ACCOUNT BALANCE</div>
                <div className="text-2xl font-bold mt-1 text-neon">
                  ${accountCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            {isTopUp && (
              <div className="mt-4 pt-4 border-t border-border text-sm">
                <span className="text-muted-foreground">Project: </span>
                <span className="font-semibold">{project.name}</span>
                <span className="text-muted-foreground ml-2">· {PROOF_TYPES[project.proofType]}</span>
              </div>
            )}
            <div className="border-t border-border mt-5 pt-4">
              <div className="text-[10px] tracking-widest text-muted-foreground">PAYMENT METHOD</div>
              <div className="text-sm font-semibold mt-1">USDC (ERC-20) · Ethereum Mainnet</div>
            </div>
            <div className="border-t border-border mt-4 pt-4">
              <div className="text-[10px] tracking-widest text-muted-foreground">TRANSACTION HASH</div>
              <div className="text-xs font-mono mt-1 break-all">{tx}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[10px] tracking-widest text-muted-foreground mb-3">FEE BREAKDOWN</div>
            <div className="panel">
              {!isTopUp && inv && (
                <Row k="INVOICE SUBTOTAL" v={`$${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
              )}
              <Row k="SERVICE FEE (2%)" v={`$${fee.toFixed(2)}`} />
              {!isTopUp && <Row k="PROCESSING FEE" v={`$${proc.toFixed(2)}`} />}
              <div className="border-t border-border" />
              <Row k="TOTAL CHARGED" v={`$${totalDeducted.toFixed(2)}`} bold />
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-full bg-neon text-black py-3 rounded-lg font-bold mt-6 shadow-neon hover:scale-[1.01] transition"
          >
            Go to Dashboard
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <button
              type="button"
              onClick={() => toast.success("Receipt downloaded")}
              className="panel py-3 font-semibold flex items-center justify-center gap-2 hover:border-neon/30 transition"
            >
              <Download className="w-4 h-4" /> Receipt
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="panel py-3 font-semibold flex items-center justify-center gap-2 hover:border-neon/30 transition"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-5 py-3 text-sm">
      <span className={bold ? "font-bold" : "text-muted-foreground tracking-widest text-[11px]"}>{k}</span>
      <span className={bold ? "font-bold text-neon" : "font-semibold"}>{v}</span>
    </div>
  );
}
