# Bitcoin Savings Calculator

## Goal
Build the requested mobile-first Bitcoin DCA calculator as the home page, with an ultra-clean iOS-inspired interface, large tap targets, immediate recalculation, and transparent use of historical pricing.

## Experience
- Use a restrained Apple-like visual system: bright layered surfaces, crisp system typography, hairline borders, soft depth, orange Bitcoin accents, and subtle motion that respects reduced-motion settings.
- Present a compact header with the Bitcoin mark and a simple “Historical simulation” status.
- Make the amount selector the first interaction: tactile `$5`, `$20`, and `$50` bill-style cards plus a `Custom` card containing a large numeric input.
- Place frequency and start year in one compact control band:
  - Four-option segmented control for Hourly, Daily, Weekly, and Monthly.
  - Accessible iOS-style vertical year wheel from 2010 through the current year, defaulting to 2016, with drag/scroll, keyboard support, and up/down buttons.
- Add polished pressed states, selection transitions, focus states, and optional vibration feedback on supported devices.

## Results
- Build a prominent result panel led by Current Portfolio Value.
- Show Total Invested, Bitcoin accumulated in BTC and satoshis, Net Profit with ROI, and Average Cost Basis.
- Use clear loading, unavailable-data, and retry states without shifting the layout.
- Include a concise estimate note whenever the selected schedule exceeds the source data’s true granularity.

## Chart
- Add an interactive responsive area/line chart comparing Total Invested with Bitcoin Portfolio Value over time.
- Use a touch-friendly crosshair and tooltip with date, invested amount, portfolio value, and BTC accumulated.
- Downsample display points while retaining exact summary calculations so long ranges remain smooth on phones.

## Calculation and data
- Load keyless BTC/USD daily history from the public Bitcoin DCA data endpoint, covering 2010-08-18 to the present, and cache it through TanStack Query.
- Calculate purchases locally so every amount, frequency, and year change updates immediately:
  - Daily, weekly, and monthly schedules use the matching UTC daily close.
  - Hourly schedules model 24 equal purchases at each available daily close; this is explicitly labeled as a daily-close estimate because true hourly data does not exist across the full range.
  - Dates before the first market record are omitted rather than assigned fabricated prices.
- Use the latest available price for current value, with deterministic UTC date handling and input validation.
- Keep the data source isolated behind a small adapter so it can be replaced without changing the interface or calculation engine.

## Implementation
- Replace the placeholder home page and add focused modules for the calculator math, historical-price query, amount cards, year wheel, results, and chart.
- Extend the existing semantic color and typography tokens; use the installed button/input/chart building blocks and Recharts.
- Add unique home-page title, description, Open Graph metadata, `og:type`, and Twitter card metadata.
- Verify calculations with focused tests, then inspect the live page at mobile and desktop sizes for scrolling, touch targets, text fit, chart rendering, and interaction behavior.
