import { useState } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterOption = { key: string; label: string };

type Props = {
  title?: string;
  options: FilterOption[];
  selected: string[];
  onChange: (keys: string[]) => void;
  className?: string;
};

export function FilterPanel({ title = "Filters", options, selected, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const active = selected.length > 0;

  const toggle = (key: string) => {
    if (selected.includes(key)) onChange(selected.filter((k) => k !== key));
    else onChange([...selected, key]);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "panel px-3 py-1.5 text-xs flex items-center gap-2 transition",
          active && "border-neon/50 text-neon",
        )}
      >
        <Filter className="w-3 h-3" />
        {title}
        {active && <span className="bg-neon text-black rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">{selected.length}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full mt-2 z-50 panel p-4 min-w-[200px] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-widest text-muted-foreground">{title}</span>
              {active && (
                <button type="button" onClick={() => onChange([])} className="text-[10px] text-neon hover:underline">
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2">
              {options.map((o) => (
                <label key={o.key} className="flex items-center gap-2 text-sm cursor-pointer hover:text-neon transition">
                  <input
                    type="checkbox"
                    checked={selected.includes(o.key)}
                    onChange={() => toggle(o.key)}
                    className="accent-[#9eff00]"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neon/15 text-neon border border-neon/30 text-[10px] font-bold">
      {label}
      <button type="button" onClick={onRemove} aria-label="Remove filter">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
