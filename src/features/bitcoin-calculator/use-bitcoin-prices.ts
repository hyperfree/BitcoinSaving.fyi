import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { normalizePriceSeries } from "./calculator";

const PRICES_URL = "https://btcdollarcostaverage.com/api/v1/prices?from=2010-08-18";

type PriceResponse = {
  asOf?: string;
  source?: string;
  note?: string;
  series?: unknown;
};

async function fetchBitcoinPrices() {
  const response = await fetch(PRICES_URL);
  if (!response.ok) throw new Error("Historical prices are temporarily unavailable.");
  const payload = (await response.json()) as PriceResponse;
  const prices = normalizePriceSeries(payload.series);
  if (prices.length === 0) throw new Error("No historical prices were returned.");
  return {
    prices,
    asOf: payload.asOf,
    source: payload.source ?? "BTC/USD daily close",
    note: payload.note,
  };
}

type PriceData = Awaited<ReturnType<typeof fetchBitcoinPrices>>;
const CACHE_KEY = "btc-daily-prices-v1";

function readCache(): { data: PriceData; savedAt: number } | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as { data: PriceData; savedAt: number }) : undefined;
  } catch {
    return undefined;
  }
}

async function fetchAndCache() {
  const data = await fetchBitcoinPrices();
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {
    // storage full or blocked — fine, just skip caching
  }
  return data;
}

export function useBitcoinPrices() {
  const queryClient = useQueryClient();
  // Seed from the saved copy right after hydration so repeat visits show results instantly.
  useEffect(() => {
    if (queryClient.getQueryData(["bitcoin-daily-prices"])) return;
    const cached = readCache();
    if (cached) queryClient.setQueryData(["bitcoin-daily-prices"], cached.data, { updatedAt: cached.savedAt });
  }, [queryClient]);
  return useQuery({
    queryKey: ["bitcoin-daily-prices"],
    queryFn: fetchAndCache,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });
}
