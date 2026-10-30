const TOOLS_LINKS: Array<{ label: string; href: string }> = [
  { label: "Bitcoin DCA Calculator", href: "https://bitcoinsaving.fyi/dca/" },
  { label: "Sats to Bitcoin", href: "https://bitcoinsaving.fyi/sats-to-bitcoin/" },
  { label: "BTC to USD", href: "https://bitcoinsaving.fyi/btc-to-usd/" },
  { label: "Lump Sum vs DCA", href: "https://bitcoinsaving.fyi/lump-sum-vs-dca/" },
  { label: "Fee Calculator", href: "https://bitcoinsaving.fyi/fees/" },
  { label: "Share a Plan", href: "https://bitcoinsaving.fyi/share/" },
];

const LEARN_LINKS: Array<{ label: string; href: string }> = [
  { label: "Learn Hub", href: "https://bitcoinsaving.fyi/learn/" },
  { label: "What Is a Sat?", href: "https://bitcoinsaving.fyi/learn/what-is-a-sat/" },
  { label: "How Recurring Buying Works", href: "https://bitcoinsaving.fyi/learn/how-recurring-buying-works/" },
  { label: "Fees, Explained", href: "https://bitcoinsaving.fyi/learn/fees-explained/" },
  { label: "Blog", href: "https://bitcoinsaving.fyi/blog/" },
  { label: "What is DCA?", href: "https://bitcoinsaving.fyi/dca/" },
  { label: "Get the App", href: "https://bitcoinsaving.fyi/download/" },
];

const ABOUT_LINKS: Array<{ label: string; href: string }> = [
  { label: "Support", href: "https://bitcoinsaving.fyi/support/" },
  { label: "Privacy", href: "https://bitcoinsaving.fyi/privacy/" },
  { label: "Terms", href: "https://bitcoinsaving.fyi/terms/" },
];

function LinkColumn({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <a href={link.href} className="text-[#E8EEF5] transition-colors hover:text-white">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-[52px] bg-[#07182B] font-body text-[14.5px] leading-relaxed text-[#C7D2DF]">
      <div className="mx-auto w-full max-w-[1120px] px-[22px] py-12">
        <div className="grid gap-10 min-[780px]:grid-cols-2">
          <div>
            <p className="font-display text-[17px] font-semibold text-white">BitcoinSaving</p>
            <p className="mt-3 max-w-md">
              A free Bitcoin DCA calculator: pick an amount, a rhythm (hourly, daily, weekly, bi-weekly or monthly)
              and a start year, and replay what regular buying would have done on daily Bitcoin prices back to 2010.
            </p>
          </div>
          <div>
            <p className="max-w-md">
              New to Bitcoin saving? Get one short email a week: a real savings story, the numbers behind it, in
              plain words, plus first access when the app launches.
            </p>
            <form action="https://bitcoinsaving.fyi/signup.php" method="post" className="mt-4 flex max-w-md gap-2">
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-[14.5px] text-[#16222E] outline-none placeholder:text-[#5A6A77]"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-full bg-[#F7931A] px-5 text-[14.5px] font-bold text-white transition-[filter] hover:brightness-95"
              >
                Join free
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3">
          <LinkColumn title="Tools" links={TOOLS_LINKS} />
          <LinkColumn title="Learn" links={LEARN_LINKS} />
          <LinkColumn title="About" links={ABOUT_LINKS} />
        </div>

        <p className="mt-12 border-t border-white/10 pt-6 text-[13px] leading-6 text-[#C7D2DF]/80">
          BitcoinSaving is an educational calculator that replays past prices. It does not buy, sell or hold Bitcoin,
          and it is not financial advice. Past performance does not predict future results. Historical prices:
          Coinbase via btcdollarcostaverage.com. Live converter prices: Coinbase. Live header price: mempool.space.
        </p>
      </div>
    </footer>
  );
}
