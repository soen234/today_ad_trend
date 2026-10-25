import type { Role, Section } from './types.ts';

export const USER_AGENT = 'TodayAdTrendBot/1.0 (+https://todayadtrend.com)';
export const SITE_URL = 'https://todayadtrend.com';
export const PULSE_PAGE_URL = `${SITE_URL}/pulse`;
export const PULSE_ITEM_SOURCE = 'TAT Creative Pulse';

export const ROLES: readonly Role[] = ['performance', 'ua', 'brand'];
export const SECTIONS: readonly Section[] = ['news', 'platform', 'expert', 'creative'];

export const ROLE_INFO: Record<Role, { label: string; description: string }> = {
  performance: {
    label: 'performance marketers',
    description: 'paid social/search campaign managers optimizing CPA/ROAS',
  },
  ua: {
    label: 'UA & app marketers',
    description: 'mobile app user-acquisition marketers dealing with MMPs, SKAN/AdAttributionKit, app ad networks, ASO',
  },
  brand: {
    label: 'brand & creative marketers',
    description: 'brand and creative marketers dealing with messaging, creative, campaigns, brand safety',
  },
};

export const PLATFORMS = [
  'meta', 'google', 'youtube', 'tiktok', 'apple', 'amazon', 'microsoft', 'snap', 'linkedin', 'reddit', 'x', 'other',
] as const;
export type Platform = (typeof PLATFORMS)[number];

export interface SourceConfig {
  name: string;
  section: Exclude<Section, 'creative'>;
  feedUrl: string;
  /** Human-facing homepage, published in latest.json `sources`. */
  homeUrl: string;
  /** Platform every item from this source is about (official platform blogs). */
  platform?: Platform;
}

// Mobile Dev Memo is intentionally absent: on 2026-10-25 every feed URL of mdm.co
// (and mobiledevmemo.com/feed/) 301-redirects to the HTML homepage, so it has no parseable items.
export const SOURCES: readonly SourceConfig[] = [
  // news
  { section: 'news', name: 'AdExchanger', feedUrl: 'https://www.adexchanger.com/feed/', homeUrl: 'https://www.adexchanger.com/' },
  { section: 'news', name: 'Digiday', feedUrl: 'https://digiday.com/feed/', homeUrl: 'https://digiday.com/' },
  { section: 'news', name: 'PPC Land', feedUrl: 'https://ppc.land/rss/', homeUrl: 'https://ppc.land/' },
  { section: 'news', name: 'Social Media Today', feedUrl: 'https://www.socialmediatoday.com/feeds/news/', homeUrl: 'https://www.socialmediatoday.com/' },
  { section: 'news', name: 'Adweek', feedUrl: 'https://www.adweek.com/feed/', homeUrl: 'https://www.adweek.com/' },
  { section: 'news', name: 'Marketing Dive', feedUrl: 'https://www.marketingdive.com/feeds/news/', homeUrl: 'https://www.marketingdive.com/' },
  { section: 'news', name: 'Business of Apps', feedUrl: 'https://www.businessofapps.com/feed/', homeUrl: 'https://www.businessofapps.com/' },
  { section: 'news', name: 'Search Engine Journal (Paid Media)', feedUrl: 'https://www.searchenginejournal.com/category/paid-media/feed/', homeUrl: 'https://www.searchenginejournal.com/category/paid-media/' },
  // platform
  { section: 'platform', name: 'Meta for Business', feedUrl: 'https://www.facebook.com/business/news/rss?locale=en_US', homeUrl: 'https://www.facebook.com/business/news', platform: 'meta' },
  { section: 'platform', name: 'Meta for Developers', feedUrl: 'https://developers.facebook.com/blog/feed/', homeUrl: 'https://developers.facebook.com/blog/', platform: 'meta' },
  { section: 'platform', name: 'Google Ads & Commerce Blog', feedUrl: 'https://blog.google/products/ads-commerce/rss/', homeUrl: 'https://blog.google/products/ads-commerce/', platform: 'google' },
  { section: 'platform', name: 'Google Ads Developer Blog', feedUrl: 'https://ads-developers.googleblog.com/feeds/posts/default/-/google_ads_api', homeUrl: 'https://ads-developers.googleblog.com/', platform: 'google' },
  { section: 'platform', name: 'Apple Developer News', feedUrl: 'https://developer.apple.com/news/rss/news.rss', homeUrl: 'https://developer.apple.com/news/', platform: 'apple' },
  { section: 'platform', name: 'YouTube Official Blog', feedUrl: 'https://blog.youtube/rss/', homeUrl: 'https://blog.youtube/', platform: 'youtube' },
  { section: 'platform', name: 'Microsoft Advertising Blog', feedUrl: 'https://about.ads.microsoft.com/en/blog/rss', homeUrl: 'https://about.ads.microsoft.com/en/blog', platform: 'microsoft' },
  // expert
  { section: 'expert', name: 'Seth Godin', feedUrl: 'https://seths.blog/feed/', homeUrl: 'https://seths.blog/' },
  { section: 'expert', name: 'SparkToro', feedUrl: 'https://sparktoro.com/blog/feed/', homeUrl: 'https://sparktoro.com/blog/' },
  { section: 'expert', name: 'Stratechery (Ben Thompson)', feedUrl: 'https://stratechery.com/feed/', homeUrl: 'https://stratechery.com/' },
  { section: 'expert', name: 'Andrew Chen', feedUrl: 'https://andrewchen.substack.com/feed', homeUrl: 'https://andrewchen.substack.com/' },
  { section: 'expert', name: 'Elena Verna', feedUrl: 'https://www.elenaverna.com/feed', homeUrl: 'https://www.elenaverna.com/' },
  { section: 'expert', name: 'Growth Memo (Kevin Indig)', feedUrl: 'https://www.growth-memo.com/feed', homeUrl: 'https://www.growth-memo.com/' },
  { section: 'expert', name: "Lenny's Newsletter", feedUrl: 'https://www.lennysnewsletter.com/feed', homeUrl: 'https://www.lennysnewsletter.com/' },
  { section: 'expert', name: 'Common Thread Collective', feedUrl: 'https://commonthreadco.com/blogs/coachs-corner.atom', homeUrl: 'https://commonthreadco.com/blogs/coachs-corner' },
  { section: 'expert', name: 'Jon Loomer', feedUrl: 'https://www.jonloomer.com/feed/', homeUrl: 'https://www.jonloomer.com/' },
];

/** The Creative Pulse data source, listed in latest.json `sources` next to the feeds. */
export const PULSE_DATA_SOURCE = {
  name: 'Google Ads Transparency Center',
  section: 'creative' as const,
  url: 'https://adstransparency.google.com/',
};

export const INGEST = {
  timeoutMs: 20_000,
  concurrency: 6,
  maxAgeDays: 7,
  snippetMaxChars: 600,
  titleMaxChars: 300,
} as const;

export const STATE = {
  itemDays: 30,
  /** Number of edition dates (each with one edition per role) kept in state and published. */
  editionDates: 30,
} as const;

export const FEED = {
  days: 14,
  maxItems: 200,
} as const;

export const ENRICH = {
  batchSize: 12,
  maxRequestsPerRun: 6,
  maxAttempts: 3,
  /** Snippet characters sent to the LLM per item (keeps a 12-item prompt well under 8k tokens). */
  promptSnippetChars: 400,
  summaryMaxChars: 280,
  soWhatMaxChars: 160,
  maxTags: 4,
  tagMaxChars: 32,
} as const;

export const LLM_DEFAULTS = {
  baseUrl: 'https://models.github.ai/inference',
  model: 'openai/gpt-4.1-mini',
  /** Free tier: 15 requests/min. */
  minIntervalMs: 4_500,
  timeoutMs: 60_000,
  temperature: 0.2,
  maxTokens: 4_000,
} as const;

export const EDITION = {
  buildHourUtc: 21,
  /** Target date = UTC date of (now + 3h). */
  dateOffsetHours: 3,
  windowHours: 48,
  /** Used only when the 48 h window cannot fill the minimum (ingest keeps 7 days). */
  fallbackWindowHours: 24 * 7,
  target: 6,
  min: 5,
  max: 7,
  maxPerSection: 3,
  maxPerSource: 2,
  previousEditionsExcluded: 2,
  pulseFreshHours: 24,
  headlineMaxChars: 140,
} as const;

export const PULSE = {
  bucket: 'ads-transparency-center',
  prefix: 'api-data/creative-stats/',
  listUrl: 'https://storage.googleapis.com/storage/v1/b/ads-transparency-center/o',
  objectBaseUrl: 'https://storage.googleapis.com/ads-transparency-center/',
  shardsSampled: 24,
  shardConcurrency: 4,
  shardTimeoutMs: 15 * 60_000,
  listTimeoutMs: 30_000,
  /**
   * The bucket keeps stale shards from older exports under the same names (on 2026-10-25:
   * 2,500 current files plus 2,500 from 2025-10-15). Only objects updated within this many hours
   * of the newest object are treated as the current export.
   */
  currentGenerationHours: 36,
  /** Week-over-week deltas are only reported when both weeks have at least this many new creatives in the sample. */
  minNewForDelta: 300,
  /** weekEnd = today(UTC) − 2 days (the dump lags by about a day). */
  weekEndLagDays: 2,
  longRunnerMinDays: 90,
  longRunnerRecentDays: 3,
  topLaunchersMax: 10,
  topLauncherMinCreatives: 5,
  longRunnersMax: 10,
  rebuildWeekdayUtc: 1, // Monday
  rebuildHourUtc: 21,
  maxAgeDays: 7,
} as const;
