# Bitcoin Savings Simulator V2

Build "Bitcoin Savings Calculator", a top-notch 2026 iOS-style minimalist Bitcoin DCA calculator:

- Aesthetic & UX: Pixel-perfect, ultra-clean minimalist 2026 iOS design language (subtle materials, crisp SF-style typography, high contrast, smooth haptics/animations, no loud clutter). Mobile-first with large, effortless tap targets for older eyes.
- Amount Selector: 4 cards ($5, $20, $50, and Custom). The $5, $20, and $50 cards use realistic dollar bill images/graphics as tactile visual cards. The 4th card is Custom with a clean, large numeric input.
- Compact Side-by-Side Control Bar:
  - Left side: Narrow segmented frequency toggle (Hourly, Daily, Weekly, Monthly).
  - Right side: Authentic iOS-style drum wheel picker defaulting to 2016 (10 years), scrollable and step-clickable with arrows back to 2010.
- Headline Results Card: Large, uncluttered readout for Current Portfolio Value, accompanied by Total Invested, Accumulated Bitcoin (BTC + satoshis), Net Profit / ROI %, and Average Cost Basis.
- Minimalist Chart: Interactive compounding line/area chart below showing Total Invested vs Bitcoin Portfolio Value over time with smooth tooltips.
- Calculation engine powered by historical Bitcoin price data from 2010 to present.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bitcoin-savings-v2.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/748a1664-97f8-4acb-855f-e02209446c3b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
