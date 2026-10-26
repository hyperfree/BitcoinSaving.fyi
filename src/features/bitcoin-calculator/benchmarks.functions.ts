import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UA = { "User-Agent": "Mozilla/5.0" };

export const getBenchmarkPrices = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ symbol: z.string().trim().min(1).max(20).regex(/^[\w.^=-]+$/) }).parse(data),
  )
  .handler(async ({ data }) => {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(data.symbol)}?period1=1262304000&period2=${Math.floor(Date.now() / 1000)}&interval=1d`;
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error("Price history unavailable for this ticker.");
    const json = (await res.json()) as any;
    const r = json?.chart?.result?.[0];
    const ts: number[] = r?.timestamp ?? [];
    const closes: Array<number | null> = r?.indicators?.adjclose?.[0]?.adjclose ?? r?.indicators?.quote?.[0]?.close ?? [];
    const series: Array<[number, number]> = [];
    ts.forEach((t, i) => {
      const c = closes[i];
      if (typeof c === "number" && c > 0) {
        const d = new Date(t * 1000);
        series.push([Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), c]);
      }
    });
    if (series.length === 0) throw new Error("No price history found for this ticker.");
    return { symbol: data.symbol, name: (r?.meta?.longName ?? r?.meta?.shortName ?? data.symbol) as string, series };
  });

export const searchTickers = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ q: z.string().trim().min(1).max(40) }).parse(data))
  .handler(async ({ data }) => {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(data.q)}&quotesCount=8&newsCount=0`,
      { headers: UA },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as any;
    return ((json?.quotes ?? []) as any[])
      .filter((q) => q.symbol && ["EQUITY", "ETF", "INDEX", "MUTUALFUND", "FUTURE", "CRYPTOCURRENCY"].includes(q.quoteType))
      .map((q) => ({ symbol: String(q.symbol), name: String(q.longname ?? q.shortname ?? q.symbol), type: String(q.typeDisp ?? q.quoteType) }));
  });
