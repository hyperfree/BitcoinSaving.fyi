export type Frequency = "hourly" | "daily" | "weekly" | "biweekly" | "monthly";

export type PricePoint = {
  timestamp: number;
  date: string;
  price: number;
};

export type ChartPoint = {
  timestamp: number;
  date: string;
  invested: number;
  portfolioValue: number;
  bitcoin: number;
};

export type CalculationResult = {
  currentValue: number;
  totalInvested: number;
  bitcoin: number;
  satoshis: number;
  netProfit: number;
  roi: number;
  averageCost: number;
  purchaseCount: number;
  chart: ChartPoint[];
};

const DAY = 86_400_000;

function isPurchaseDay(point: PricePoint, index: number, frequency: Frequency, lastPurchase?: number) {
  if (frequency === "daily" || frequency === "hourly") return true;
  if (index === 0) return true;
  const date = new Date(point.timestamp);
  if (frequency === "weekly") return date.getUTCDay() === 1;
  if (frequency === "biweekly") return date.getUTCDay() === 1 && (lastPurchase === undefined || point.timestamp - lastPurchase >= 13 * DAY);
  return date.getUTCDate() === 1;
}

function thinChart(points: ChartPoint[], maxPoints = 180) {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const sampled = points.filter((_, index) => index % step === 0);
  const last = points.at(-1);
  if (last && sampled.at(-1)?.timestamp !== last.timestamp) sampled.push(last);
  return sampled;
}

/** Forward-fills benchmark closes onto the Bitcoin calendar so both schedules buy on the same dates. */
export function alignToCalendar(calendar: PricePoint[], series: PricePoint[]): PricePoint[] {
  const sorted = [...series].sort((a, b) => a.timestamp - b.timestamp);
  const out: PricePoint[] = [];
  let j = 0;
  let last: number | undefined;
  for (const day of calendar) {
    for (let next = sorted[j]; next && next.timestamp <= day.timestamp; next = sorted[++j]) last = next.price;
    if (last !== undefined) out.push({ timestamp: day.timestamp, date: day.date, price: last });
  }
  return out;
}

export function calculateDca(
  prices: PricePoint[],
  amount: number,
  frequency: Frequency,
  startYear: number,
  maxChartPoints = 180,
): CalculationResult {
  const validAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const start = Date.UTC(startYear, 0, 1);
  const eligible = prices
    .filter((point) => point.timestamp >= start && point.price > 0)
    .sort((a, b) => a.timestamp - b.timestamp);

  let invested = 0;
  let bitcoin = 0;
  let purchaseCount = 0;
  const chart: ChartPoint[] = [];
  let lastPurchase: number | undefined;

  eligible.forEach((point, index) => {
    if (isPurchaseDay(point, index, frequency, lastPurchase)) {
      lastPurchase = point.timestamp;
      const purchases = frequency === "hourly" ? 24 : 1;
      const dailyInvestment = validAmount * purchases;
      invested += dailyInvestment;
      bitcoin += dailyInvestment / point.price;
      purchaseCount += purchases;
    }

    chart.push({
      timestamp: point.timestamp,
      date: point.date,
      invested,
      portfolioValue: bitcoin * point.price,
      bitcoin,
    });
  });

  const latestPrice = eligible.at(-1)?.price ?? 0;
  const currentValue = bitcoin * latestPrice;
  const netProfit = currentValue - invested;

  return {
    currentValue,
    totalInvested: invested,
    bitcoin,
    satoshis: Math.round(bitcoin * 100_000_000),
    netProfit,
    roi: invested > 0 ? (netProfit / invested) * 100 : 0,
    averageCost: bitcoin > 0 ? invested / bitcoin : 0,
    purchaseCount,
    chart: thinChart(chart, maxChartPoints),
  };
}

export function normalizePriceSeries(series: unknown): PricePoint[] {
  if (!Array.isArray(series)) return [];
  return series.flatMap((entry) => {
    if (!Array.isArray(entry) || entry.length < 2) return [];
    const timestamp = Number(entry[0]);
    const price = Number(entry[1]);
    if (!Number.isFinite(timestamp) || !Number.isFinite(price) || price <= 0) return [];
    return [{ timestamp, date: new Date(timestamp).toISOString().slice(0, 10), price }];
  });
}

export function estimateDays(prices: PricePoint[]) {
  const first = prices.at(0)?.timestamp;
  const last = prices.at(-1)?.timestamp;
  if (first === undefined || last === undefined) return 0;
  return Math.round((last - first) / DAY) + 1;
}
