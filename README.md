# Perf Dashboard

A real-time web performance analyzer powered by Google PageSpeed Insights. Paste any URL and get a full breakdown of Core Web Vitals, performance score, and analysis history — in seconds.

**Live demo:** https://next-perf-dashboard.vercel.app

---

## Features

- **Core Web Vitals** — LCP, FCP, CLS, INP, TTFB with value, rating, and reference thresholds
- **Performance score** — 0–100 radial chart with color coding (green / yellow / red)
- **Mobile vs Desktop** — switch strategies before running the analysis
- **Analysis history** — last 20 results persisted in localStorage via Zustand
- **Smart cache** — results are reused for 10 minutes; older entries are re-fetched automatically
- **Error handling** — friendly messages for rate limits, crawler blocks, and timeouts
- **Performance trends** — visualize how a URL's Core Web Vitals evolve over multiple analyses with an interactive line chart (toggle mobile/desktop)

## Known Limitations

- Analysis takes **20–50 seconds** — the PageSpeed API runs a real Lighthouse audit on Google's servers
- Some sites block Google's crawler and will always return an error (e.g. YouTube)
- The free API tier is rate-limited per IP; an API key is strongly recommended for production use

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Data fetching | React Query (`useMutation`) |
| State / persistence | Zustand with `persist` middleware |
| Charts | Recharts |
| API | Google PageSpeed Insights v5 |

## Running Locally

```bash
git clone https://github.com/guirab/next-perf-dashboard.git
cd next-perf-dashboard
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### API Key (optional but recommended)

Without a key the PageSpeed API is rate-limited per IP. To increase the quota, create a free key in [Google Cloud Console](https://console.cloud.google.com), enable the **PageSpeed Insights API**, and add it to a `.env.local` file at the project root:

```
PAGESPEED_API_KEY=your_key_here
```

The key is only used server-side and is never exposed to the browser.

## Testing

The project uses [Vitest](https://vitest.dev) with Testing Library for unit and component tests.

```bash
npm test           # run all tests once
npm run test:watch # watch mode
npm run test:ui    # browser UI
```

**Coverage:**
- `lib/metrics.ts` — `getRating`, `formatMetricValue`, color helpers
- `lib/pagespeed.ts` — response parsing, error handling (429, 500, absent audits)
- `app/api/analyze/route.ts` — URL validation, strategy defaulting, error propagation
- `components/UrlInput.tsx` — URL normalization, validation messages
- `store/useHistoryStore.ts` — add, cap at 20, clear, id uniqueness

## Deploying

The easiest way to deploy is via [Vercel](https://vercel.com). Connect the GitHub repository and Vercel will build and deploy every push automatically.

Remember to add `PAGESPEED_API_KEY` in **Settings → Environment Variables** on Vercel, otherwise production requests will hit the anonymous rate limit.

## Project Structure

```
app/
  api/analyze/route.ts   # POST handler — validates URL, calls PageSpeed API
  layout.tsx             # Root layout with providers and font
  page.tsx               # Main page
components/
  AnalysisProgress.tsx   # Animated progress bar shown during analysis
  CompareToggle.tsx      # Mobile / Desktop strategy toggle
  HistoryList.tsx        # Grid of recent analyses loaded from localStorage
  MetricCard.tsx         # Individual metric with value, rating, and mini bar
  ScoreCard.tsx          # Radial chart score card
  UrlInput.tsx           # URL input with normalization and validation
  ui/                    # shadcn/ui primitives
hooks/
  useAnalyze.ts          # useMutation wrapper; exposes analyze + loadCached
lib/
  metrics.ts             # Thresholds, getRating(), and color helpers
  pagespeed.ts           # PageSpeed Insights API client
store/
  useHistoryStore.ts     # Zustand store with localStorage persistence
types/
  metrics.ts             # Shared TypeScript types
```

## License

MIT