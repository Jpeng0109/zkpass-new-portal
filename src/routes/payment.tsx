import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, PROOF_TYPES } from "@/lib/store";
import { useState } from "react";
import { ArrowLeft, Copy, ShieldCheck, Wallet, Loader2 } from "lucide-react";
import { z } from "zod";
import { OFFICIAL_CRYPTO, formatUsdcAmount, isValidTxHash } from "@/lib/crypto-payment";
import { toast } from "sonner";

const searchSchema = z.object({
  type: z.enum(["invoice", "topup"]),
  amount: z.coerce.number(),
  invoiceId: z.string().optional(),
  projectId: z.string().optional(),
});

export const Route = createFileRoute("/payment")({
  component: PaymentPage,
  validateSearch: (s) => searchSchema.parse(s),
});

function PaymentPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { projects, invoices, payInvoice, topUpProject } = useStore();
  const [txHash, setTxHash] = useState("");
  const [processing, setProcessing] = useState(false);

  const project = projects.find((p) => p.id === search.projectId) || projects[0];
  const invoice = search.invoiceId ? invoices.find((i) => i.id === search.invoiceId) : null;
  const isTopUp = search.type === "topup";
  /** Invoice flow passes amount already including 15% tax from billing drawer */
  const subtotal = search.amount;
  const fee = isTopUp ? subtotal * 0.02 : 0;
  const total = subtotal + fee;

  const copyAddress = () => {
    navigator.clipboard.writeText(OFFICIAL_CRYPTO.address);
    toast.success("Treasury address copied");
  };

  const submit = async () => {
    const hash = txHash.trim();
    if (!isValidTxHash(hash)) {
      toast.error("Enter a valid Ethereum transaction hash (0x + 64 hex characters)");
      return;
    }
    setProcessing(true);
    try {
      if (isTopUp) {
        await topUpProject(project.id, subtotal, hash);
        navigate({
          to: "/receipt",
          search: { type: "topup", amount: total, projectId: project.id, txHash: hash },
        });
      } else if (invoice) {
        const paid = await payInvoice(invoice.id, hash);
        if (!paid) throw new Error("Payment failed");
        navigate({
          to: "/receipt",
          search: { type: "invoice", id: invoice.id, amount: paid.paidTotal, txHash: hash },
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="page-container max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => navigate({ to: isTopUp ? "/projects" : "/billing" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {isTopUp ? "Back to Projects" : "Back to Billing"}
        </button>

        <div className="panel p-6 sm:p-8 relative overflow-hidden neon-glow-bg">
          <div className="absolute top-0 left-0 right-0 h-1 bg-neon" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 panel flex items-center justify-center">
              <Wallet className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Crypto Payment</h1>
              <p className="text-sm text-muted-foreground">
                {isTopUp ? project.name : invoice?.id} · {OFFICIAL_CRYPTO.asset}
              </p>
            </div>
          </div>

          <div className="panel p-4 mb-4 border-neon/30 bg-neon/5">
            <div className="text-[10px] tracking-widest text-neon font-bold mb-3">OFFICIAL ZKPASS TREASURY</div>
            <Row k="Network" v={OFFICIAL_CRYPTO.network} />
            <Row k="Asset" v={OFFICIAL_CRYPTO.asset} />
            <div className="mt-3">
              <div className="text-[10px] tracking-widest text-muted-foreground mb-1">DEPOSIT ADDRESS</div>
              <div className="flex items-center justify-between gap-2 panel p-3">
                <span className="text-xs font-mono break-all">{OFFICIAL_CRYPTO.address}</span>
                <button type="button" onClick={copyAddress} className="text-muted-foreground hover:text-neon shrink-0">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">{OFFICIAL_CRYPTO.memo}</p>
          </div>

          <div className="panel p-4 mb-4">
            <div className="text-[10px] tracking-widest text-muted-foreground mb-2">AMOUNT TO SEND</div>
            {isTopUp ? (
              <>
                <Row k="Project" v={project.name} />
                <Row k="Template" v={PROOF_TYPES[project.proofType]} />
              </>
            ) : (
              <Row k="Invoice" v={invoice?.id ?? "—"} />
            )}
            <div className="border-t border-border my-3" />
            <Row k="Subtotal" v={formatUsdcAmount(subtotal)} />
            <Row k="Platform Fee (2%)" v={formatUsdcAmount(fee)} />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="font-bold text-lg">Total (USDC)</span>
              <span className="text-neon font-bold text-xl">{formatUsdcAmount(total)}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10px] tracking-widest text-muted-foreground">YOUR PAYMENT TRANSACTION HASH *</label>
            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x… (64 hex characters after 0x)"
              className="w-full mt-2 panel px-4 py-3 text-sm font-mono outline-none focus:border-neon/50 transition"
            />
            <p className="text-[11px] text-muted-foreground mt-2">
              After sending USDC to the official address above, paste your on-chain transaction hash here for verification.
            </p>
          </div>

          <div className="panel p-4 mb-6 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-neon shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Payments are crypto-only. We verify your transaction on {OFFICIAL_CRYPTO.network} before crediting your account.
            </p>
          </div>

          {processing ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="w-10 h-10 text-neon animate-spin" />
              <p className="font-semibold">Verifying on-chain transaction…</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!txHash.trim()}
              className="w-full bg-neon text-black py-3.5 rounded-lg font-bold shadow-neon hover:scale-[1.01] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Transaction & Confirm Payment
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm gap-4">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="font-semibold text-right break-all">{v}</span>
    </div>
  );
}
