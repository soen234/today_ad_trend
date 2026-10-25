# Today Ad Trend — Daily Briefing Redesign

Date: 2026-10-25
Status: approved for autonomous execution (user set the goal "improve everything, review, and submit")

## 1. Why

The shipped app was an RSS news list plus three tabs that only rendered AdMob test ads by size.
Its backend (Supabase project `jwyjvinmgdozkgzydmax`) no longer exists, so the app and the
`todayadtrend.com` news/blog pages have no data source at all.

The product is being redefined as **a daily, finishable ad-industry briefing for marketing practitioners**.

| Decision | Value | Source |
|---|---|---|
| Target user | Global marketing practitioners | user |
| Success metric | Daily-open habit (DAU, D7 retention) | user |
| Main surface | Briefing-centered: 5–7 curated items per day, "done for today" state | user |
| Personalization | Role-based editions, chosen at onboarding | user |
| Roles | Performance marketer, UA / app marketer, Brand & creative marketer | Claude (user delegated) |
| Data rule | Only sources that work today without approvals or paid scraping ("되는 것만") | user |
| Later | Branding, ASO, landing page rework | user |

## 2. Sources (all verified live on 2026-10-25)

| Section | What | Sources |
|---|---|---|
| `news` | Market & industry news | AdExchanger, Digiday, PPC Land, Social Media Today, Adweek, Marketing Dive, Business of Apps, SEJ Paid Media |
| `platform` | Official platform updates / policy | Meta for Business news, Meta for Developers blog, Google Ads & Commerce blog, Google Ads API dev blog, Apple Developer news, YouTube official blog, Microsoft Advertising blog |
| `expert` | Expert takes (stand-in for X/Threads posts) | Seth Godin, SparkToro, Stratechery, Andrew Chen, Elena Verna, Kevin Indig (Growth Memo), Lenny's Newsletter, Common Thread Collective, Jon Loomer |
| `creative` | Creative Pulse: what advertisers launch | Google Ads Transparency Center public daily dump (EEA + Turkey), sampled shards |

Not used (blocked by approvals, cost or ToS): X API, Threads API (App Review), Meta Ad Library API
(identity verification), TikTok, LinkedIn, scraping vendors. The source list is config, so adding
one later is a config change plus, for APIs, a new fetcher.

Content policy: we store and show title, our own AI summary, and a link to the original. No full-text
republishing, no images hot-linked from publishers except the feed-provided thumbnail URL.

## 3. Architecture

```
GitHub Actions (cron, 4x/day)          GitHub Pages (static JSON, /v1)        Clients
┌──────────────────────────────┐      ┌──────────────────────────────┐      ┌─────────────────────┐
│ pipeline/ (Node 24, TS)      │      │ latest.json                  │      │ Expo app (iOS/And.) │
│  ingest RSS ──► dedupe       │ ───► │ editions/<date>/<role>.json  │ ◄─── │ todayadtrend.com    │
│  enrich (LLM, batched)       │      │ feed/<section>.json (14 d)   │      │ (Next.js, ISR)      │
│  build editions (daily)      │      │ pulse/latest.json            │      └─────────────────────┘
│  creative pulse (weekly)     │      └──────────────────────────────┘
│  state ⇄ `data` branch       │
└──────────────────────────────┘
```

- **No database, no accounts.** State (enriched items, last 30 days) lives in `state/` on an orphan
  `data` branch. Each run checks it out, updates it, commits, and deploys `public/` to Pages.
- **LLM**: GitHub Models (`openai/gpt-4.1-mini`) through the workflow's `GITHUB_TOKEN`
  (`permissions: models: read`), via the OpenAI-compatible chat completions API. Base URL, model and
  key are env-configurable so a paid provider can replace it. If the LLM call fails, the item keeps a
  feed-snippet summary and rule-based classification; the run never fails because of the LLM.
- **Schedule**: runs at 03:00, 09:00, 15:00, 21:00 UTC. Every run ingests and enriches. The 21:00 run
  builds the edition dated (now + 3h) UTC, i.e. the next calendar day — ready before 08:00 in Asia and
  Europe and the evening before in the Americas. The Monday 21:00 run (or any run where the pulse is
  more than 7 days old) rebuilds the Creative Pulse.
- **Push**: local scheduled notifications (`expo-notifications`) at the user's chosen time (default
  08:00 local). No device tokens, no server. Notification text is generic ("Your 3-minute brief is
  ready"), the app fetches the edition when opened.

## 4. Data contract (`/v1`, all JSON, UTF-8)

```ts
type Role = 'performance' | 'ua' | 'brand';
type Section = 'news' | 'platform' | 'expert' | 'creative';

interface RoleTake { relevance: 0 | 1 | 2 | 3; soWhat: string }   // soWhat ≤ 160 chars, '' if relevance 0

interface Item {
  id: string;              // sha1(canonical url).slice(0, 12)
  section: Section;
  title: string;
  url: string;
  source: string;          // publisher or expert display name
  publishedAt: string;     // ISO 8601 UTC
  summary: string;         // ≤ 280 chars, our words
  platforms: string[];     // subset of meta|google|youtube|tiktok|apple|amazon|microsoft|snap|linkedin|reddit|x|other
  tags: string[];          // ≤ 4 short lowercase topics
  importance: 1 | 2 | 3 | 4 | 5;
  roles: Record<Role, RoleTake>;
  imageUrl?: string;
  enriched: boolean;       // false = fallback summary, no AI takes
}

interface Edition {
  version: 1; date: string /* YYYY-MM-DD */; role: Role; generatedAt: string;
  headline: string;        // one sentence framing today's brief for the role
  items: Item[];           // 5–7, ordered
}

interface PulseStat { label: string; share: number; deltaPt: number }   // share 0..1, delta in points vs prior week
interface CreativePulse {
  version: 1; generatedAt: string; weekStart: string; weekEnd: string;
  sample: { shards: number; totalShards: number; creatives: number; newThisWeek: number; newPriorWeek: number };
  formatMix: PulseStat[];          // VIDEO / IMAGE / TEXT share of creatives first shown this week
  audienceSignals: PulseStat[];    // share of new creatives using each audience approach
  topLaunchers: { advertiser: string; newCreatives: number; exampleUrl: string }[];
  longRunners: { advertiser: string; format: string; firstShown: string; url: string }[];
  insights: string[];              // 3 plain sentences, LLM-written from the numbers above
}

interface Latest {
  version: 1; generatedAt: string; editionDate: string | null;
  editions: Record<Role, string | null>;   // relative paths
  feeds: Record<Section, string>;          // relative paths
  pulse: string | null;
  sources: { name: string; section: Section; url: string }[];
}
```

`feed/<section>.json` = `{ version: 1, generatedAt, items: Item[] }`, newest first, last 14 days, max 200.

## 5. Edition selection (deterministic, after enrichment)

Candidates: enriched-or-not items published in the 48 h before the edition cut, excluding items used
in the role's previous two editions. Score = `importance × 2 + relevance × 3 + freshness` where
freshness is 2 (< 12 h), 1 (< 24 h), 0 otherwise. Items with role relevance 0 are excluded. Pick by
score with diversity caps: at most 3 from one section, at most 2 from one source, and at least one
`platform` item when any candidate exists. Target 6 items, minimum 5 when available, maximum 7.
If the pulse was rebuilt in the last 24 h, one synthetic `creative` item linking to the pulse leads
the brand edition and is included in the other two.

## 6. App (Expo SDK 54, expo-router)

- **Onboarding** (first launch): value prop → choose role → choose brief time + notification permission.
- **Tabs**: `Today` (brief), `Explore` (segmented: News / Platforms / Experts / Creative Pulse),
  `Saved` (swipe file + watchlist), `Settings`.
- **Today**: date, role, headline, progress (`3 of 6 read`), item cards with summary, a highlighted
  "So what for you" line, source + relative time, save button. Opening an item marks it read
  (in-app browser). When all are read: "You're done for today" card with streak count and the next
  brief time. Pull to refresh.
- **Streak**: consecutive local days with at least one brief item read. Stored locally.
- **Saved**: items saved from anywhere (stored as full item JSON, local). Watchlist: free-text
  keywords (brands, platforms, topics). Feed items matching a keyword get a badge and are listed
  under the watchlist.
- **Settings**: role, brief time, notifications toggle, watchlist, privacy policy, contact, version.
- **Ads**: AdMob banner every 8 items in Explore lists only. Nothing in the brief, so finishing stays clean.
  Non-personalized requests, no ATT prompt (no tracking). Test IDs in dev, production IDs in release;
  on failure the slot collapses (no test-ad fallback in production).
- **Removed**: Supabase, auth screens/stores, format demo tabs, screenshot/media-library code,
  tracking transparency, unused mock/reference code, and the matching Android storage/media permissions.
- **State**: TanStack Query for remote JSON (cached; offline shows last cached brief), Zustand +
  AsyncStorage persist for preferences, read state, saved items, watchlist, streak.

## 7. Web (`ad_trend_landing/next-app`, todayadtrend.com)

- Reads the same `/v1` JSON with ISR (`revalidate: 3600`); Supabase client removed.
- `/` hero with new positioning + today's performance brief preview, `/news` → `/brief` (today's three
  editions with role switcher; `/news` redirects), `/pulse` (Creative Pulse), existing `/guide`, `/blog` (MDX),
  `/privacy` kept. Supabase cron routes removed.
- SEO: metadata + sitemap updated for the new pages.

## 8. Branding & ASO

- Name stays **Today Ad Trend** (short: TAT). Positioning line: "What changed in advertising today —
  and what it means for you." Store name `Today Ad Trend: Ad Briefing` (27), subtitle
  `Your 3-minute marketing brief` (29).
- Palette: ink `#0B1B2B`, signal green `#12B76A` (primary), sky `#2E90FA` (platform), amber `#F79009`
  ("so what"), violet `#7A5AF8` (experts), rose `#EE46BC` (creative). System font.
- New icon: rising "signal bar" mark on ink, no lettering; rendered from SVG at 1024 px.
- Store listing copy (description, keywords, promo text, what's new) in `store.config.json` for EAS
  Metadata; 6.9" screenshots generated from the web build with captions.

## 9. Error handling

- Pipeline: per-feed failures are logged and skipped; a run with zero successful feeds exits non-zero
  (alerting via the failed workflow). LLM failures fall back as above. JSON is validated against the
  contract before deploy; an invalid build is not deployed.
- App: network failure shows the cached brief with an "offline" note, or an empty state with retry.
  Missing edition for today shows the latest available edition with its date.

## 10. Testing

- Pipeline: `node --test` unit tests for feed parsing, dedupe, scoring/selection, pulse aggregation,
  and contract validation; one end-to-end dry run against live feeds with the LLM disabled.
- App: `tsc --noEmit`, `expo export` for iOS and web, and a web smoke run screenshot per screen.
- Web: `next build` against the live `/v1` data.

## 11. Out of scope now

X / Threads ingestion, Meta Ad Library, user accounts and cloud sync, server push, Expo SDK major upgrade.
