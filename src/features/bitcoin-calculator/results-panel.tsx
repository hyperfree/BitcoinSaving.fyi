import { ArrowDownRight, ArrowUpRight } from "lucide-react";
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

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-result-muted">{label}</dt>
      <dd className="mt-1 truncate font-numeral text-[21px] font-normal tabular-nums text-result-foreground">{value}</dd>
      {detail ? <p className="mt-0.5 truncate text-[11px] tabular-nums text-result-muted">{detail}</p> : null}
    </div>
  );
}

export function ResultsPanel({ result, amount, frequency, startYear }: { result: CalculationResult; amount: number; frequency: Frequency; startYear: number }) {
  const positive = result.netProfit >= 0;
  const isBillionDollarResult = Math.abs(result.currentValue) >= 1_000_000_000;
  return (
    <section className="result-panel relative overflow-hidden" aria-labelledby="result-title">
      <img
        src="/bitcoin-logo.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -right-12 size-36 opacity-100 md:bottom-auto md:-top-12 md:-right-32 md:size-[20rem] lg:-right-24"
      />
      <div className="relative sm:pr-24 md:pr-48 lg:pr-56">
        <p id="result-title" className="text-[clamp(10px,2.9vw,14px)] font-medium leading-snug">
          <span className="text-result-muted">If you had saved {usd.format(amount)} {frequency} from {startYear},</span>
          {" "}
          <span className="text-result-foreground">you'd have:</span>
        </p>
        <p className={isBillionDollarResult
          ? "mt-1 block h-[clamp(3.604rem,20.14vw,6.784rem)] overflow-hidden whitespace-nowrap font-numeral text-[2.7rem] font-normal leading-[1.06] tracking-normal min-[400px]:text-[3rem] text-result-foreground sm:text-[4rem] lg:text-[4.5rem]"
          : "mt-1 block h-[clamp(3.604rem,20.14vw,6.784rem)] overflow-hidden whitespace-nowrap font-numeral text-[clamp(3.4rem,19vw,6.4rem)] font-normal leading-[1.06] tracking-normal text-result-foreground"
        }>
          {usd.format(result.currentValue)}
        </p>
      </div>

      <dl className="relative mt-7 grid grid-cols-2 gap-x-5 gap-y-5 sm:mt-14 sm:grid-cols-4 sm:pr-24 md:pr-48 lg:pr-56">
        <Metric label="Bitcoin" value={`${btc.format(result.bitcoin)} BTC`} detail={`${compact.format(result.satoshis)} sats`} />
        <Metric label="Total invested" value={usd.format(result.totalInvested)} detail={`${integer.format(result.purchaseCount)} buys`} />
        <div className="min-w-0">
          <dt className="text-xs font-medium text-result-muted">Net profit</dt>
          <dd className="mt-1 flex items-center gap-1 font-numeral text-[21px] font-normal tabular-nums text-result-foreground">
            {positive ? <ArrowUpRight className="size-4 text-gain" /> : <ArrowDownRight className="size-4 text-loss" />}
            <span className="truncate">{usd.format(result.netProfit)}</span>
          </dd>
          <p className={positive ? "mt-0.5 text-[11px] text-gain" : "mt-0.5 text-[11px] text-loss"}>
            {positive ? "+" : ""}{result.roi.toLocaleString("en-US", { maximumFractionDigits: 1 })}% ROI
          </p>
        </div>
        <Metric label="Average cost" value={usd.format(result.averageCost)} detail="per bitcoin" />
      </dl>
    </section>
  );
}
