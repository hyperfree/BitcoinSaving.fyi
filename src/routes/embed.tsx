import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AmountSelector } from "@/features/bitcoin-calculator/amount-selector";
import { calculateDca, type Frequency } from "@/features/bitcoin-calculator/calculator";
import { GrowthChart, type GrowthPoint } from "@/features/bitcoin-calculator/growth-chart";
import { ResultsPanel } from "@/features/bitcoin-calculator/results-panel";
import { useBitcoinPrices } from "@/features/bitcoin-calculator/use-bitcoin-prices";
import { YearWheel } from "@/features/bitcoin-calculator/year-wheel";

const frequencies: Array<{ value: Frequency; label: string }> = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

export const Route = createFileRoute("/embed")({
  head: () => ({
    meta: [
      { title: "Bitcoin Savings Widget — Embeddable DCA Calculator" },
      { name: "description", content: "Embeddable Bitcoin DCA savings calculator widget." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Embed,
});

function Embed() {
  const [amount, setAmount] = useState(20);
  const [custom, setCustom] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [startYear, setStartYear] = useState(2016);
  const hydratedFromUrl = useRef(false);
  const pricesQuery = useBitcoinPrices();

  // Allow the embedding site to preset the simulation via URL params.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = Number(params.get("amount"));
    if (Number.isFinite(a) && a > 0 && a <= 9999) {
      setAmount(Math.round(a));
      setCustom(![5, 20, 50].includes(Math.round(a)));
    }
    const f = params.get("freq");
    if (f && frequencies.some((x) => x.value === f)) setFrequency(f as Frequency);
    const y = Number(params.get("year"));
    if (Number.isInteger(y) && y >= 2010 && y <= new Date().getFullYear()) setStartYear(y);
    hydratedFromUrl.current = true;
  }, []);

  const result = useMemo(
    () => calculateDca(pricesQuery.data?.prices ?? [], amount, frequency, startYear),
    [pricesQuery.data?.prices, amount, frequency, startYear],
  );

  const chartData: GrowthPoint[] = result.chart;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[760px] px-3 pb-4 pt-3 sm:px-5 sm:pt-5">
        <section className="control-surface" aria-label="Investment settings">
          <AmountSelector
            value={amount}
            custom={custom}
            onChange={(nextAmount, isCustom) => {
              setAmount(nextAmount);
              setCustom(isCustom);
            }}
          />

          <div className="mt-[26px] grid grid-cols-1 items-start gap-[26px] sm:grid-cols-2 sm:gap-10">
            <fieldset className="min-w-0">
              <legend className="step-title">
                <span className="section-number">2</span>
                Frequency
              </legend>
              <div className="segmented-control">
                <span
                  aria-hidden="true"
                  className="segment-thumb"
                  style={{ transform: `translateX(${Math.max(0, frequencies.findIndex((item) => item.value === frequency)) * 100}%)` }}
                />
                {frequencies.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={frequency === item.value}
                    onClick={() => {
                      setFrequency(item.value);
                      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(6);
                    }}
                    className={cn("segment", frequency === item.value && "segment-active")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex min-w-0 flex-col items-stretch">
              <p className="step-title">
                <span className="section-number">3</span>
                <span>Starting Year</span>
              </p>
              <YearWheel value={startYear} onChange={setStartYear} />
            </div>
          </div>
        </section>

        <div className="mt-4" aria-live="polite">
          {pricesQuery.isPending ? (
            <div className="result-panel min-h-[260px] animate-pulse" aria-label="Loading historical prices">
              <div className="h-4 w-40 rounded bg-result-skeleton" />
              <div className="mt-4 h-14 w-3/4 rounded bg-result-skeleton" />
              <div className="mt-8 grid grid-cols-2 gap-5 border-t border-result-border pt-5 sm:grid-cols-4">
                {[0, 1, 2, 3].map((item) => <div key={item} className="h-12 rounded bg-result-skeleton" />)}
              </div>
            </div>
          ) : pricesQuery.isError ? (
            <div className="error-panel">
              <AlertCircle className="size-6 text-loss" />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">Prices could not be loaded</h2>
                <p className="mt-1 text-sm text-muted-foreground">Check your connection, then try again.</p>
              </div>
              <Button variant="outline" onClick={() => pricesQuery.refetch()} className="h-11 rounded-control">
                <RefreshCw /> Retry
              </Button>
            </div>
          ) : (
            <ResultsPanel result={result} amount={amount} frequency={frequency} startYear={startYear} />
          )}
        </div>

        {pricesQuery.data && chartData.length > 0 ? (
          <div className="mt-4">
            <GrowthChart data={chartData} />
          </div>
        ) : null}

        <p className="mt-4 text-center text-[11px] font-medium text-muted-foreground">
          <a
            href="https://bitcoinsaving.fyi"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Powered by bitcoinsaving.fyi
          </a>
        </p>
      </div>
    </main>
  );
}
