# Today Ad Trend

A 3-minute daily ad-industry brief for marketing practitioners. Every morning: 5–7 things that changed
in advertising, picked for your role (performance, UA / app, brand & creative), each with a one-line
"so what". Plus Explore (news, official platform updates, expert takes), a weekly Creative Pulse built
from the Google Ads Transparency Center, a swipe file and a keyword watchlist.

- App: Expo SDK 54 / expo-router (this repo, root)
- Data pipeline: `pipeline/` (GitHub Actions → GitHub Pages static JSON, no database)
- Website: [todayadtrend.com](https://todayadtrend.com) ([soen234/ad_trend_landing](https://github.com/soen234/ad_trend_landing))
- Design spec: [`docs/superpowers/specs/2026-10-25-daily-briefing-design.md`](docs/superpowers/specs/2026-10-25-daily-briefing-design.md)

## How it works

```
.github/workflows/pipeline.yml  (03, 09, 15, 21 UTC)
  RSS ingest → LLM enrichment (Claude) → role editions (21 UTC) → Creative Pulse (weekly)
  state → orphan `data` branch          output → GitHub Pages: https://soen234.github.io/today_ad_trend/v1/
```

The app and the website only read that JSON. User data (role, reminder time, read state, saved items,
watchlist, streak) stays on the device. The daily reminder is a local notification.

## Develop

```bash
npm ci
npx expo start            # press i / a / w
npm test                  # unit tests
npm run typecheck
cd pipeline && npm ci && npm test && npm run dry-run   # pipeline tests and a local run without the LLM
```

The data host is `DATA_BASE_URL` in `lib/config.ts`.

## Pipeline operations

- Manual run: Actions → *pipeline* → Run workflow (`force_edition`, `force_pulse`).
- LLM: Claude via the Anthropic SDK. Add the repository secret `ANTHROPIC_API_KEY` (Settings → Secrets and
  variables → Actions). Defaults: `claude-opus-5-5` at `low` effort with the server-side refusal fallback;
  override with repository variables `LLM_MODEL` / `LLM_EFFORT`. Without a key (or if a call fails) items keep
  feed-snippet summaries and keyword-based role relevance, with no "so what", and the run still publishes.
- Sources live in `pipeline/src/config.ts`.

## Release (iOS)

```bash
eas build -p ios --profile production --auto-submit   # first time: log in with the Apple ID (renews the provisioning profile, sets up the ASC API key)
eas metadata:push                                     # store listing from store.config.json
```

Then in App Store Connect: upload `store/screenshots/*.png` (6.9"), check App Privacy
(no tracking; AdMob diagnostics/ads data not linked to the user), and *Add for Review*.
