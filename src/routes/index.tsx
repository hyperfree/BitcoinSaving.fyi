import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, ArrowUpRight, BookOpen, Check, Info, Link2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/theme-switch";
import { cn } from "@/lib/utils";
import { AmountSelector } from "@/features/bitcoin-calculator/amount-selector";
import { useQueries } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { alignToCalendar, calculateDca, normalizePriceSeries, type Frequency } from "@/features/bitcoin-calculator/calculator";
import { getBenchmarkPrices } from "@/features/bitcoin-calculator/benchmarks.functions";
import { COMPARE_COLORS, CompareSelector, PRESET_BENCHMARKS, type Benchmark } from "@/features/bitcoin-calculator/compare-selector";
import { FeedbackDialog } from "@/features/bitcoin-calculator/feedback-dialog";
import { FrequencyWheel } from "@/features/bitcoin-calculator/frequency-wheel";
import { GrowthChart, type CompareSeries, type GrowthPoint } from "@/features/bitcoin-calculator/growth-chart";
import { ResultsPanel } from "@/features/bitcoin-calculator/results-panel";
import { useBitcoinPrices } from "@/features/bitcoin-calculator/use-bitcoin-prices";
import { YearBar } from "@/features/bitcoin-calculator/year-bar";

const frequencies: Array<{ value: Frequency; label: string }> = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bitcoin Savings Calculator — Historical DCA Returns" },
      { name: "description", content: "Calculate how recurring Bitcoin purchases would have grown using historical BTC prices from 2010 to today." },
      { property: "og:title", content: "Bitcoin Savings Calculator" },
      { property: "og:description", content: "See the historical value of hourly, daily, weekly, or monthly Bitcoin savings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://bitcoinsaving.fyi/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: "https://bitcoinsaving.fyi/og-image.jpg" },
    ],
  }),
  component: Index,
});

function Index() {
  const [amount, setAmount] = useState(20);
  const [custom, setCustom] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [startYear, setStartYear] = useState(2016);
  const [selected, setSelected] = useState<Benchmark[]>([]);
  const [customBenchmarks, setCustomBenchmarks] = useState<Benchmark[]>([]);
  const [copied, setCopied] = useState(false);
  const hydratedFromUrl = useRef(false);
  const pricesQuery = useBitcoinPrices();

  // Restore a shared simulation from the URL once on load.
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
    const cmp = params.get("compare");
    if (cmp) {
      const picks = cmp.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean).slice(0, 5);
      const extra: Benchmark[] = [];
      const chosen = picks.map((sym) => {
        const preset = PRESET_BENCHMARKS.find((b) => b.symbol.toUpperCase() === sym);
        if (preset) return preset;
        const b = { symbol: sym, label: sym } as Benchmark;
        extra.push(b);
        return b;
      });
      setCustomBenchmarks(extra);
      setSelected(chosen);
    }
    hydratedFromUrl.current = true;
  }, []);

  const searchString = useMemo(() => {
    const params = new URLSearchParams({ amount: String(amount), freq: frequency, year: String(startYear) });
    if (selected.length) params.set("compare", selected.map((b) => b.symbol).join(","));
    return params.toString();
  }, [amount, frequency, startYear, selected]);

  // Keep the address bar in sync so the page can be bookmarked or shared.
  useEffect(() => {
    if (!hydratedFromUrl.current) return;
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${searchString}`);
  }, [searchString]);

  const shareUrl = `https://bitcoinsaving.fyi/?${searchString}`;
  const result = useMemo(
    () => calculateDca(pricesQuery.data?.prices ?? [], amount, frequency, startYear),
    [pricesQuery.data?.prices, amount, frequency, startYear],
  );

  const allBenchmarks = [...PRESET_BENCHMARKS, ...customBenchmarks];
  const colorFor = (symbol: string) =>
    COMPARE_COLORS[Math.max(0, allBenchmarks.findIndex((b) => b.symbol === symbol)) % COMPARE_COLORS.length] ?? "var(--compare-1)";
  const fetchBenchmark = useServerFn(getBenchmarkPrices);
  const benchmarkQueries = useQueries({
    queries: selected.map((b) => ({
      queryKey: ["benchmark", b.symbol],
      queryFn: () => fetchBenchmark({ data: { symbol: b.symbol } }),
      staleTime: 60 * 60 * 1000,
      retry: 1,
    })),
  });

  const benchmarkResults = selected.map((b, i) => {
    const q = benchmarkQueries[i];
    if (!q?.data || !pricesQuery.data) return { b, status: q?.isError ? ("error" as const) : ("loading" as const) };
    const aligned = alignToCalendar(pricesQuery.data.prices, normalizePriceSeries(q.data.series));
    return { b, status: "ready" as const, res: calculateDca(aligned, amount, frequency, startYear, Infinity) };
  });

  const compareSeries: CompareSeries[] = benchmarkResults.map(({ b, status, res }) => ({
    key: `cmp_${b.symbol}`,
    label: b.label,
    color: colorFor(b.symbol),
    status,
    currentValue: res?.currentValue,
    roi: res?.roi,
  }));

  const chartData: GrowthPoint[] = result.chart.map((point) => {
    const row: GrowthPoint = { ...point };
    benchmarkResults.forEach(({ b, res }) => {
      if (!res) return;
      const match = res.chart.find((p) => p.timestamp === point.timestamp);
      if (match) row[`cmp_${b.symbol}`] = match.portfolioValue;
    });
    return row;
  });

  const shareText = `If I stacked $${amount} ${frequency} into Bitcoin since ${startYear}, I'd have $${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(result.currentValue)} (${new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(result.bitcoin)} BTC) today (+${result.roi.toLocaleString("en-US", { maximumFractionDigits: 1 })}% ROI). Simulate your stack:`;
  const shareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-12 pt-5 sm:px-7 sm:pt-8 lg:px-10">
        <header className="mb-8 flex items-center justify-between gap-3 sm:mb-11">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/bitcoin-logo.svg" alt="Bitcoin" className="my-auto block size-14 shrink-0 self-center drop-shadow-sm sm:size-16" />
            <div>
              <p className="font-display text-[17px] font-semibold leading-tight">Bitcoin Savings Simulator</p>
              <p className="text-xs text-muted-foreground">DCA calculator</p>
            </div>
          </div>
          <ThemeSwitch />
        </header>

        <div className="mb-6 max-w-2xl sm:mb-8">
          <h1 className="text-xl font-medium leading-snug tracking-tight text-foreground sm:text-2xl">
            Pick amount, frequency and starting year to simulate your Bitcoin savings.
          </h1>
        </div>

        <section className="control-surface" aria-label="Investment settings">
          <AmountSelector
            value={amount}
            custom={custom}
            onChange={(nextAmount, isCustom) => {
              setAmount(nextAmount);
              setCustom(isCustom);
            }}
            aside={<FrequencyWheel value={frequency} onChange={setFrequency} />}
          />

          <div className="mt-5">
            <YearBar value={startYear} onChange={setStartYear} />
          </div>
        </section>

        <div className="mt-5" aria-live="polite">
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
            <>
              <ResultsPanel result={result} amount={amount} frequency={frequency} startYear={startYear} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <a
                  href="https://lightning.news/buy-bitcoin-worldwide/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-bitcoin text-[15px] font-semibold text-bitcoin-foreground shadow-bitcoin transition-[filter] active:brightness-95"
                >
                  Buy Bitcoin
                  <ArrowUpRight className="size-4" />
                </a>
                <a
                  href="https://lightning.news/5-resources-get-started-bitcoin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-border bg-surface text-[15px] font-semibold text-foreground shadow-hairline transition-colors active:bg-muted"
                >
                  <BookOpen className="size-4 text-bitcoin" />
                  Study Bitcoin
          </a>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-12 min-w-0 flex-1 items-center gap-1 rounded-control border border-border bg-surface p-1 shadow-hairline focus-within:border-bitcoin/40">
            <input
              type="text"
              readOnly
              value={shareText}
              aria-label="Preview of the share text"
              onFocus={(event) => event.currentTarget.select()}
              className="h-full min-w-0 flex-1 rounded-control-inner bg-transparent px-4 text-sm text-foreground outline-none sm:text-[15px]"
            />
            <a
              href={shareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-full shrink-0 items-center gap-2 rounded-control-inner bg-foreground px-4 text-[15px] font-semibold text-background transition-opacity active:opacity-80"
            >
              Share on
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className="size-4">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
          <button
            type="button"
            aria-label="Copy link to this simulation"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              } catch {
                /* clipboard unavailable */
              }
            }}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-control border border-border bg-surface px-4 text-[15px] font-semibold text-foreground shadow-hairline transition-colors active:bg-muted"
          >
            {copied ? <Check className="size-4 text-gain" /> : <Link2 className="size-4" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy link"}</span>
          </button>
        </div>

            </>
          )}
        </div>

        {pricesQuery.data && result.chart.length > 0 ? (
          <div className="mt-5">
            <GrowthChart data={chartData} series={compareSeries}>
              {benchmarkResults.some((r) => r.res) ? (
                <div className="mt-2 mb-4 flex flex-wrap gap-2">
                  {benchmarkResults.map(({ b, res }) => {
                    if (!res || res.currentValue <= 0) return null;
                    const diff = ((result.currentValue - res.currentValue) / res.currentValue) * 100;
                    const ahead = diff >= 0;
                    return (
                      <span
                        key={b.symbol}
                        className={cn(
                          "inline-flex items-center rounded-control border px-3 py-1.5 text-sm font-medium",
                          ahead ? "border-gain/30 bg-gain/10 text-gain" : "border-loss/30 bg-loss/10 text-loss",
                        )}
                      >
                        Bitcoin {ahead ? "outperformed" : "underperformed"} {b.label} by {ahead ? "+" : ""}
                        {diff.toLocaleString("en-US", { maximumFractionDigits: 0 })}%
                      </span>
                    );
                  })}
                </div>
              ) : null}
              <CompareSelector
                selected={selected}
                custom={customBenchmarks}
                colorFor={colorFor}
                onToggle={(b) =>
                  setSelected((cur) => (cur.some((x) => x.symbol === b.symbol) ? cur.filter((x) => x.symbol !== b.symbol) : [...cur, b]))
                }
                onAddCustom={(b) => {
                  setCustomBenchmarks((cur) => (cur.some((x) => x.symbol === b.symbol) || PRESET_BENCHMARKS.some((x) => x.symbol === b.symbol) ? cur : [...cur, b]));
                  setSelected((cur) => (cur.some((x) => x.symbol === b.symbol) ? cur : [...cur, b]));
                }}
                onRemoveCustom={(symbol) => {
                  setCustomBenchmarks((cur) => cur.filter((x) => x.symbol !== symbol));
                  setSelected((cur) => cur.filter((x) => x.symbol !== symbol));
                }}
              />
            </GrowthChart>
          </div>
        ) : null}

        <footer className="mt-5 flex flex-col gap-3 rounded-md border border-border bg-surface px-4 py-4 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-start">
          <Info className="mt-0.5 size-4 shrink-0 text-bitcoin" />
          <div className="min-w-0 flex-1">
            <p>
              Historical estimates use daily BTC/USD closes from 18 Aug 2010. Hourly selections model 24 equal purchases at each day’s closing price; weekly and monthly purchases use the available close. Past performance does not guarantee future results.
            </p>
            <nav aria-label="Footer" className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-medium">
              <a href="https://bitcoinorstuff.com" target="_blank" rel="noopener noreferrer" className="footer-link">BitcoinorStuff.com</a>
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Methodology</a>
              <a href="#" className="footer-link">Contact</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Disclaimer</a>
              <FeedbackDialog>
                <button type="button" className="footer-link">Feedback</button>
              </FeedbackDialog>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
