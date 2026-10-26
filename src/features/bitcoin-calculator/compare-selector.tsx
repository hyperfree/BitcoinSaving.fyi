import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchTickers } from "./benchmarks.functions";

export type Benchmark = { symbol: string; label: string };

export const PRESET_BENCHMARKS: Benchmark[] = [
  { symbol: "GC=F", label: "Gold" },
  { symbol: "^GSPC", label: "S&P500" },
  { symbol: "NVDA", label: "NVIDIA" },
  { symbol: "URTH", label: "MSCI" },
];

export const COMPARE_COLORS = ["var(--compare-1)", "var(--compare-2)", "var(--compare-3)", "var(--compare-4)", "var(--compare-5)"];

type Props = {
  selected: Benchmark[];
  custom: Benchmark[];
  colorFor: (symbol: string) => string;
  onToggle: (b: Benchmark) => void;
  onAddCustom: (b: Benchmark) => void;
  onRemoveCustom: (symbol: string) => void;
};

export function CompareSelector({ selected, custom, colorFor, onToggle, onAddCustom, onRemoveCustom }: Props) {
  const [open, setOpen] = useState(false);
  const isOn = (s: string) => selected.some((b) => b.symbol === s);
  const pill = (b: Benchmark, removable = false) => {
    const on = isOn(b.symbol);
    return (
      <span key={b.symbol} className="inline-flex">
        <button
          type="button"
          aria-pressed={on}
          onClick={() => {
            onToggle(b);
            if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(6);
          }}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-control border px-4 text-[15px] font-medium transition-colors",
            on ? "border-foreground bg-foreground text-background" : "border-border bg-surface text-foreground active:bg-muted",
            removable && "rounded-r-none pr-3",
          )}
        >
          <i className="size-2.5 rounded-full" style={{ background: on ? colorFor(b.symbol) : "var(--muted-foreground)" }} />
          {b.label}
        </button>
        {removable ? (
          <button
            type="button"
            aria-label={`Remove ${b.label}`}
            onClick={() => onRemoveCustom(b.symbol)}
            className={cn(
              "inline-flex h-11 items-center rounded-r-full border border-l-0 pl-2 pr-3",
              on ? "border-foreground bg-foreground text-background" : "border-border bg-surface text-muted-foreground",
            )}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </span>
    );
  };

  return (
    <div className="mt-5 border-t border-border pt-4">
      <p className="mb-3 text-sm font-semibold text-foreground">Compare with</p>
      <div className="flex flex-wrap gap-2">
        {PRESET_BENCHMARKS.map((b) => pill(b))}
        {custom.map((b) => pill(b, true))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-control border border-dashed border-border px-4 text-[15px] font-medium text-muted-foreground active:bg-muted"
        >
          <Search className="size-4" /> Search Ticker
        </button>
      </div>
      <TickerDialog
        open={open}
        onOpenChange={setOpen}
        onPick={(b) => {
          onAddCustom(b);
          setOpen(false);
        }}
      />
    </div>
  );
}

function TickerDialog({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (b: Benchmark) => void }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const search = useServerFn(searchTickers);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);
  const results = useQuery({
    queryKey: ["ticker-search", debounced],
    queryFn: () => search({ data: { q: debounced } }),
    enabled: debounced.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Search ticker</DialogTitle>
        </DialogHeader>
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Apple, TSLA, QQQ" className="h-12 text-base" />
        <div className="max-h-72 overflow-y-auto">
          {results.isFetching ? <p className="py-3 text-sm text-muted-foreground">Searching…</p> : null}
          {results.data?.length === 0 && !results.isFetching ? <p className="py-3 text-sm text-muted-foreground">No matches.</p> : null}
          {results.data?.map((r) => (
            <button
              key={r.symbol}
              type="button"
              onClick={() => onPick({ symbol: r.symbol, label: r.symbol })}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left active:bg-muted hover:bg-muted"
            >
              <span className="min-w-0">
                <span className="block font-semibold">{r.symbol}</span>
                <span className="block truncate text-xs text-muted-foreground">{r.name} · {r.type}</span>
              </span>
              <Plus className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
