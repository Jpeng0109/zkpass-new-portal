import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { OFFICIAL_CRYPTO } from "@/lib/crypto-payment";

const PRESETS = [500, 1000, 2500, 5000, 10000];

export function TopUpModal() {
  const navigate = useNavigate();
  const { isTopUpModalOpen, setTopUpModalOpen, projects, selectedProjectId } = useStore();
  const [amount, setAmount] = useState("1000");

  if (!isTopUpModalOpen) return null;

  const project = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const proceed = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid top-up amount");
      return;
    }
    setTopUpModalOpen(false);
    navigate({
      to: "/payment",
      search: { type: "topup", amount: value, projectId: project.id },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setTopUpModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel w-full sm:max-w-lg p-6 sm:p-8 relative overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 neon-glow-bg rounded-t-2xl sm:rounded-lg max-h-[90dvh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-neon" />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 panel flex items-center justify-center">
              <Wallet className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Top-up & Recharge</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Project: {project.name}</p>
            </div>
          </div>
          <button type="button" onClick={() => setTopUpModalOpen(false)} className="text-muted-foreground hover:text-foreground transition" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="panel p-3 mt-4 text-xs text-muted-foreground">
          Payment method: <span className="text-neon font-bold">{OFFICIAL_CRYPTO.asset}</span> on {OFFICIAL_CRYPTO.network}
        </div>

        <div className="mt-6">
          <label className="text-[10px] tracking-widest text-muted-foreground">AMOUNT (USD / USDC)</label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              className="w-full bg-input border border-border rounded-lg pl-8 pr-4 py-3 text-xl font-bold outline-none focus:border-neon/50 transition"
              placeholder="0.00"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-md border transition",
                  amount === String(p) ? "bg-neon/15 text-neon border-neon/40" : "panel hover:border-neon/30",
                )}
              >
                ${p.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button type="button" onClick={() => setTopUpModalOpen(false)} className="flex-1 panel py-3 font-semibold hover:bg-secondary transition">
            Cancel
          </button>
          <button type="button" onClick={proceed} className="flex-1 bg-neon text-black py-3 rounded-lg font-bold shadow-neon hover:scale-[1.01] transition">
            Continue to Crypto Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
