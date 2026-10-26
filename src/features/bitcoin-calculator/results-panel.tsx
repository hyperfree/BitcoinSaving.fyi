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
      <dd className="mt-1 flex flex-wrap items-center gap-1.5 font-numeral text-[clamp(17px,4.8vw,22px)] tabular-nums text-result-foreground">{children}</dd>
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
      <img src="/bitcoin-logo.svg" alt="" className="absolute -right-6 top-1/2 size-28 -translate-y-1/2 opacity-90 sm:right-2 sm:size-36" />
    </div>
  );
}

export function ResultsPanel({ result, amount, frequency, startYear }: { result: CalculationResult; amount: number; frequency: Frequency; startYear: number }) {
  const positive = result.netProfit >= 0;
  const value = usd.format(result.currentValue).replace("$", "");
  const roi = `${positive ? "+" : ""}${result.roi.toLocaleString("en-US", { maximumFractionDigits: 0 })}%`;
  return (
    <section className="result-panel" aria-labelledby="result-title">
      <Ornament />
      <div className="relative z-10">
        <p id="result-title" className="text-[clamp(10px,3vw,13px)] uppercase tracking-[0.28em] text-result-muted">
          Saved {usd.format(amount)} {frequency} since {startYear}
        </p>
        <p className="mt-2 whitespace-nowrap font-numeral text-[clamp(2.6rem,13vw,4.5rem)] leading-none [text-shadow:0_2px_14px_oklch(0.25_0.06_155/40%)]">
          <span className="text-[0.55em]">$</span>{value}
        </p>
        <p className="mt-2 text-[clamp(1.6rem,8vw,2.4rem)] font-semibold tabular-nums leading-tight text-result-mint">
          {btc.format(result.bitcoin)} BTC
          <span className="ml-2 align-middle text-[11px] font-normal text-result-muted">{compact.format(result.satoshis)} sats</span>
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-result-foreground/15 pt-4 sm:mt-8 sm:gap-6">
          <Stat label="Profit">
            {positive ? <ArrowUpRight className="size-4 text-gain" /> : <ArrowDownRight className="size-4 text-loss" />}
            <span className="truncate">{usd.format(result.netProfit)}</span>
            <span className="result-pill font-sans">{roi}</span>
          </Stat>
          <Stat label="Invested">
            <span className="truncate">{usd.format(result.totalInvested)}</span>
          </Stat>
          <Stat label="Avg cost">
            <span className="truncate">{usd.format(result.averageCost)}</span>
          </Stat>
        </dl>
        <p className="sr-only">{integer.format(result.purchaseCount)} buys</p>
      </div>
    </section>
  );
}
