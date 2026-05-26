# Perf Dashboard

A real-time web performance analyzer powered by Google PageSpeed Insights. Paste any URL and get a full breakdown of Core Web Vitals, performance score, and analysis history — in seconds.

---

## Features

- **Core Web Vitals** — LCP, FCP, CLS, INP, TTFB with value, rating, and reference thresholds
- **Performance score** — 0–100 radial chart with color coding (green / yellow / red)
- **Mobile vs Desktop** — switch strategies before running the analysis
- **Analysis history** — last 20 results persisted in localStorage via Zustand
- **Smart cache** — results are reused for 10 minutes; older entries are re-fetched automatically
- **Error handling** — friendly messages for rate limits, crawler blocks, and timeouts

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