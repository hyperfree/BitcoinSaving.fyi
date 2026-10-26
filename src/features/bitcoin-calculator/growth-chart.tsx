import type { ReactNode } from "react";
import { Area, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { ChartPoint } from "./calculator";

export type CompareSeries = {
  key: string;
  label: string;
  color: string;
  currentValue?: number | undefined;
  roi?: number | undefined;
  status: "loading" | "error" | "ready";
};

export type GrowthPoint = ChartPoint & Record<string, number | string | undefined>;

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const fullCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function GrowthTooltip({ active, payload, series }: { active?: boolean; payload?: Array<{ payload: GrowthPoint }>; series: CompareSeries[] }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="chart-tooltip">
      <p className="mb-2 text-xs font-semibold text-foreground">
        {new Date(`${point.date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}
      </p>
      <div className="space-y-1.5 text-xs tabular-nums">
        <div className="flex items-center justify-between gap-7"><span className="text-muted-foreground">Bitcoin</span><strong>{fullCurrency.format(point.portfolioValue)}</strong></div>
        {series.map((s) =>
          typeof point[s.key] === "number" ? (
            <div key={s.key} className="flex items-center justify-between gap-7">
              <span className="flex items-center gap-1.5 text-muted-foreground"><i className="size-2 rounded-full" style={{ background: s.color }} />{s.label}</span>
              <strong>{fullCurrency.format(point[s.key] as number)}</strong>
            </div>
          ) : null,
        )}
        <div className="flex items-center justify-between gap-7"><span className="text-muted-foreground">Invested</span><strong>{fullCurrency.format(point.invested)}</strong></div>
        <div className="flex items-center justify-between gap-7"><span className="text-muted-foreground">BTC held</span><strong>{point.bitcoin.toFixed(6)} BTC</strong></div>
      </div>
    </div>
  );
}

export function GrowthChart({ data, series = [], children }: { data: GrowthPoint[]; series?: CompareSeries[]; children?: ReactNode }) {
  const chartConfig: ChartConfig = {
    portfolioValue: { label: "Bitcoin", color: "var(--chart-portfolio)" },
    invested: { label: "Invested", color: "var(--chart-invested)" },
    ...Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }])),
  };
  return (
    <section className="chart-section" aria-labelledby="growth-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="growth-title" className="text-lg font-semibold text-foreground">Growth over time</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Portfolio value compared with cash invested</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-chart-portfolio" />Bitcoin</span>
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-chart-invested" />Invested</span>
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: s.color }} />{s.label}</span>
          ))}
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[260px] w-full aspect-auto sm:h-[340px]">
        <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} accessibilityLayer>
          <defs>
            <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-portfolioValue)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-portfolioValue)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 6" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={44} tickFormatter={(value: string) => value.slice(0, 4)} />
          <YAxis width={48} axisLine={false} tickLine={false} tickFormatter={(value: number) => compactCurrency.format(value)} />
          <Tooltip content={<GrowthTooltip series={series} />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
          <Area type="monotone" dataKey="portfolioValue" stroke="var(--color-portfolioValue)" strokeWidth={2.5} fill="url(#portfolioFill)" dot={false} activeDot={{ r: 5, strokeWidth: 3 }} />
          <Line type="monotone" dataKey="invested" stroke="var(--color-invested)" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
          {series.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4 }} isAnimationActive={false} />
          ))}
        </ComposedChart>
      </ChartContainer>
      {series.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {series.map((s) => (
            <div key={s.key} className="rounded-md border border-border px-3 py-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><i className="size-2 rounded-full" style={{ background: s.color }} />{s.label}</p>
              {s.status === "ready" && s.currentValue !== undefined ? (
                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                  {compactCurrency.format(s.currentValue)}{" "}
                  <span className={(s.roi ?? 0) >= 0 ? "text-gain" : "text-loss"}>{(s.roi ?? 0) >= 0 ? "+" : ""}{(s.roi ?? 0).toFixed(0)}%</span>
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground">{s.status === "error" ? "Unavailable" : "Loading…"}</p>
              )}
            </div>
          ))}
        </div>
      ) : null}
      {children}
    </section>
  );
}
