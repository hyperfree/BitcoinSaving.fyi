import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { CalculationResult } from "./calculator";
import type { Frequency } from "./calculator";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const btc = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-result-muted">{label}</dt>
      <dd className="mt-1 flex flex-nowrap items-center gap-1.5 font-numeral text-[clamp(24px,7vw,32px)] tabular-nums text-result-foreground">{children}</dd>
    </div>
  );
}

function Ornament() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
      <svg viewBox="0 0 380 380" className="absolute -right-28 top-1/2 size-[300px] -translate-y-1/2 sm:-right-24 sm:size-[380px]">
        <g fill="none" stroke="currentColor" className="text-result-foreground">
          <circle cx="190" cy="190" r="185" strokeOpacity="0.12" />
          <circle cx="190" cy="190" r="140" strokeOpacity="0.16" />
          <circle cx="190" cy="190" r="95" strokeOpacity="0.2" />
        </g>
      </svg>
      <img src="/bitcoin-b.svg" alt="" className="absolute -right-0.5 top-1/2 size-20 -translate-y-1/2 opacity-40 sm:right-[38px] sm:size-28" />
    </div>
  );
}

export function ResultsPanel({ result, amount, frequency, startYear }: { result: CalculationResult; amount: number; frequency: Frequency; startYear: number }) {
  const positive = result.netProfit >= 0;
  const value = usd.format(result.currentValue).replace("$", "");
  const billion = value.replace(/,/g, "").length >= 10;
  const roi = `${positive ? "+" : ""}${result.roi.toLocaleString("en-US", { maximumFractionDigits: 0 })}%`;
  return (
    <section className="result-panel" aria-labelledby="result-title">
      <Ornament />
      <div className="relative z-10">
        <p id="result-title" className="mb-4 line-clamp-2 h-[2.8em] leading-[1.4] text-[clamp(12px,3.4vw,15px)] tracking-[0.02em] text-result-muted">
          If you had saved {usd.format(amount)} {frequency} from {startYear}, you'd have:
        </p>
        {/* One breakpoint at 10 digits (≥ $1bn): shrink the hero and everything keyed to it. */}
        <div className={`flex h-[clamp(5rem,26vw,8.5rem)] flex-col justify-end overflow-hidden ${billion ? "text-[clamp(2.4rem,12vw,4rem)]" : "text-[clamp(3.1rem,16vw,5.4rem)]"}`}>
          <p className="whitespace-nowrap font-numeral leading-none [text-shadow:0_2px_14px_oklch(0.25_0.06_155/40%)]">
            <span className="text-[0.55em]">$</span>{value}
          </p>
          <p className="mt-2 whitespace-nowrap truncate text-[0.35em] font-normal tabular-nums leading-tight text-result-mint">
            {btc.format(result.bitcoin)} BTC
            <span className="ml-2 align-middle text-[0.6em] font-normal text-result-muted">₿{compact.format(result.satoshis)}</span>
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-3 gap-y-4 sm:mt-8 sm:gap-6">
          <Stat label="Net profit">
            {positive ? <ArrowUpRight className="size-4 text-gain" /> : <ArrowDownRight className="size-4 text-loss" />}
            <span className="truncate">{usd.format(result.netProfit)}</span>
          </Stat>
          <Stat label="ROI (Return)">
            <span className="truncate">{roi}</span>
          </Stat>
          <Stat label="Total invested">
            <span className="truncate">{usd.format(result.totalInvested)}</span>
          </Stat>
          <Stat label="Average cost">
            <span className="truncate">{usd.format(result.averageCost)}</span>
          </Stat>
        </dl>
        <p className="sr-only">{integer.format(result.purchaseCount)} buys</p>
      </div>
    </section>
  );
}
