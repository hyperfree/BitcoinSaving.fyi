import { useEffect, useState } from "react";

const NAV_LINKS: Array<{ label: string; href: string }> = [
  { label: "DCA Guide", href: "https://bitcoinsaving.fyi/dca/" },
  { label: "Learn", href: "https://bitcoinsaving.fyi/learn/" },
  { label: "Sats Converter", href: "https://bitcoinsaving.fyi/sats-to-bitcoin/" },
  { label: "BTC to USD", href: "https://bitcoinsaving.fyi/btc-to-usd/" },
  { label: "Lump Sum vs DCA", href: "https://bitcoinsaving.fyi/lump-sum-vs-dca/" },
  { label: "Fee Calculator", href: "https://bitcoinsaving.fyi/fees/" },
  { label: "Search", href: "https://bitcoinsaving.fyi/search/" },
];

function useBtcPrice() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("https://mempool.space/api/v1/prices");
        if (!res.ok) throw new Error("mempool failed");
        const data = (await res.json()) as { USD?: number };
        if (typeof data.USD !== "number") throw new Error("no USD field");
        if (!cancelled) setPrice(data.USD);
      } catch {
        try {
          const res = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot");
          if (!res.ok) throw new Error("coinbase failed");
          const data = (await res.json()) as { data?: { amount?: string } };
          const amount = Number(data.data?.amount);
          if (!cancelled && Number.isFinite(amount)) setPrice(amount);
        } catch {
          /* both price sources unavailable */
        }
      }
    };
    void load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return price;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const price = useBtcPrice();

  const ticker = (
    <span className="whitespace-nowrap text-[14px] text-[#D7E2EC]">
      BTC{" "}
      <span className="font-bold text-[#F7931A]">
        {price === null ? "…" : `$${Math.round(price).toLocaleString("en-US")}`}
      </span>
    </span>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#07182B] font-body">
      <div className="flex h-[58px] items-center gap-4 px-[22px]">
        <a href="https://bitcoinsaving.fyi/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-[30px] items-center justify-center rounded-full bg-[#F7931A] text-[17px] font-bold text-white">
            B
          </span>
          <span className="font-display text-[17px] font-semibold text-white">BitcoinSaving</span>
        </a>

        <nav aria-label="Site" className="mx-auto hidden items-center gap-5 min-[1024px]:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[15px] text-[#D7E2EC] transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://bitcoinsaving.fyi/download/"
            className="whitespace-nowrap rounded-lg bg-[#F7931A] px-[14px] py-2 text-[15px] font-bold text-white transition-[filter] hover:brightness-95"
          >
            Download App
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-3 min-[1024px]:ml-0">
          {ticker}
          <form
            action="https://bitcoinsaving.fyi/search/"
            method="get"
            role="search"
            className="hidden min-[640px]:block"
          >
            <input
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools and guides"
              aria-label="Search tools and guides"
              className="h-9 w-[190px] rounded-full bg-white px-4 text-[14px] text-[#16222E] outline-none placeholder:text-[#5A6A77]"
            />
          </form>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((cur) => !cur)}
            className="flex h-[42px] w-[46px] flex-col items-center justify-center gap-[5px] rounded-lg border border-white/25 min-[1024px]:hidden"
          >
            <span className="h-[2px] w-5 bg-white" />
            <span className="h-[2px] w-5 bg-white" />
            <span className="h-[2px] w-5 bg-white" />
          </button>
        </div>
      </div>

      {open ? (
        <nav aria-label="Site menu" className="border-t border-white/10 bg-[#07182B] px-[22px] pb-5 min-[1024px]:hidden">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-white/[0.08]">
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-[16.5px] text-[#D7E2EC] transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="pt-4 text-center">
            <a
              href="https://bitcoinsaving.fyi/download/"
              className="inline-block rounded-lg bg-[#F7931A] px-[14px] py-2 text-[15px] font-bold text-white"
            >
              Download App
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
