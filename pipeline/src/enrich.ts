import { ENRICH, PLATFORMS, ROLE_INFO, ROLES } from './config.ts';
import type { Platform, SourceConfig } from './config.ts';
import type { LlmClient } from './llm.ts';
import type { Item, Role, RoleTake, StoredItem } from './types.ts';
import { collapseWhitespace, log, truncate, warn } from './util.ts';

// ---------------------------------------------------------------------------
// Rule-based fallback (used at ingest and whenever the LLM fails)

const PLATFORM_PATTERNS: readonly (readonly [Platform, RegExp])[] = [
  ['meta', /\b(?:meta|facebook|instagram|whatsapp|reels)\b|\badvantage\+/i],
  ['google', /\b(google|pmax|performance max|demand gen|admob|dv360|search ads 360|gemini|merchant center|chrome|android)\b/i],
  ['youtube', /\byoutube\b/i],
  ['tiktok', /\b(tiktok|bytedance)\b/i],
  ['apple', /\b(apple|ios|ipados|app store|skan|skadnetwork|adattributionkit|safari|iphone)\b/i],
  ['amazon', /\b(amazon|twitch|prime video)\b/i],
  ['microsoft', /\b(microsoft|bing|copilot|xbox)\b/i],
  ['snap', /\b(snapchat|snap inc)\b/i],
  ['linkedin', /\blinkedin\b/i],
  ['reddit', /\breddit\b/i],
  // Case-sensitive on purpose: a bare "x" is too common, so only "X" followed by typical verbs counts.
  ['x', /\b(?:[Tt]witter|TWITTER|X Corp|xAI)\b|\bX(?:'s|’s)?(?= (?:[Aa]ds?|has|is|will|says|announced|launches|users|[Pp]remium)\b)/],
];

export function platformsFromText(text: string, hint?: Platform): string[] {
  const found = new Set<string>();
  if (hint) found.add(hint);
  for (const [platform, pattern] of PLATFORM_PATTERNS) {
    if (pattern.test(text)) found.add(platform);
  }
  return PLATFORMS.filter((p) => found.has(p));
}

/** Matches a keyword as a whole word/phrase (case-insensitive), or as a word prefix when `prefix`. */
function keywordPattern(keyword: string, prefix = false): RegExp {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(?<![a-z0-9])${escaped}${prefix ? '' : '(?![a-z0-9])'}`, 'i');
}

// 폴백 역할 키워드: LLM이 없을 때 제목+스니펫에서 서로 다른 키워드가 몇 개 맞는지로 관련도(0~3)를 정한다.
export const ROLE_KEYWORDS: Record<Role, readonly string[]> = {
  performance: [
    'meta ads', 'facebook ads', 'google ads', 'performance max', 'pmax', 'search ads', 'bidding', 'roas', 'cpa', 'cpc', 'cpm',
    'conversion', 'attribution', 'advantage+', 'shopping ads', 'paid social', 'ppc', 'ecommerce', 'retargeting',
  ],
  ua: [
    'app', 'apps', 'mobile', 'install', 'ua', 'user acquisition', 'mmp', 'skan', 'skadnetwork', 'adattributionkit', 'att', 'idfa',
    'app store', 'google play', 'aso', 'applovin', 'unity ads', 'ironsource', 'in-app', 'gaming',
  ],
  brand: [
    'brand', 'creative', 'campaign', 'agency', 'cannes', 'super bowl', 'ctv', 'tv', 'influencer', 'creator', 'sponsorship',
    'messaging', 'storytelling', 'ad of the week', 'commercial',
  ],
};

const ROLE_PATTERNS: Record<Role, readonly RegExp[]> = {
  performance: ROLE_KEYWORDS.performance.map((k) => keywordPattern(k)),
  ua: ROLE_KEYWORDS.ua.map((k) => keywordPattern(k)),
  brand: ROLE_KEYWORDS.brand.map((k) => keywordPattern(k)),
};

/** Title words that signal a change worth knowing about (+1 importance in the fallback). */
const CHANGE_PATTERNS: readonly RegExp[] = [
  ...['launches', 'new', 'ban', 'rolls out', 'introduces', 'expands'].map((k) => keywordPattern(k)),
  ...['launch', 'update', 'change', 'policy', 'deprecat', 'require'].map((k) => keywordPattern(k, true)),
];

/** Number of distinct role keywords found in `text`, mapped to relevance 0–3. */
export function keywordRelevance(role: Role, text: string): RoleTake['relevance'] {
  const matches = ROLE_PATTERNS[role].filter((pattern) => pattern.test(text)).length;
  return Math.min(3, matches) as RoleTake['relevance'];
}

/** Rule-based role takes: keyword relevance, platform items at least 1 for performance and ua, no soWhat. */
export function fallbackRoles(text: string, section: Item['section']): Record<Role, RoleTake> {
  const roles = {} as Record<Role, RoleTake>;
  for (const role of ROLES) {
    let relevance = keywordRelevance(role, text);
    if (section === 'platform' && role !== 'brand' && relevance < 1) relevance = 1;
    roles[role] = { relevance, soWhat: '' };
  }
  return roles;
}

/** Importance prior: 3 for platform, 2 otherwise; +1 when the title announces a change. */
export function fallbackImportance(title: string, section: Item['section']): Item['importance'] {
  const base = section === 'platform' ? 3 : 2;
  const bonus = CHANGE_PATTERNS.some((pattern) => pattern.test(title)) ? 1 : 0;
  return Math.min(5, base + bonus) as Item['importance'];
}

/**
 * Fallback enrichment (used at ingest and whenever the LLM fails): snippet summary, keyword
 * platforms, keyword role relevance, importance prior, empty soWhat, enriched=false.
 */
export function fallbackFields(
  title: string,
  snippet: string,
  source: Pick<SourceConfig, 'platform' | 'section'>,
): Pick<Item, 'summary' | 'platforms' | 'tags' | 'importance' | 'roles' | 'enriched'> {
  const text = `${title} ${snippet}`;
  return {
    summary: truncate(snippet || title, ENRICH.summaryMaxChars),
    platforms: platformsFromText(text, source.platform),
    tags: [],
    importance: fallbackImportance(title, source.section),
    roles: fallbackRoles(text, source.section),
    enriched: false,
  };
}

// 광고와 무관한 TV 시청률/박스오피스 기사는 수집 단계에서 버린다 (보수적으로 작게 유지).
const OFF_TOPIC_TITLE_PATTERNS: readonly RegExp[] = [/\bratings:/i, /\bbox office\b/i, /\bcable news ratings\b/i];

/** True for titles that are clearly not about advertising (TV ratings, box office). */
export function isOffTopicTitle(title: string): boolean {
  return OFF_TOPIC_TITLE_PATTERNS.some((pattern) => pattern.test(title));
}

// ---------------------------------------------------------------------------
// LLM enrichment

export type EnrichmentFields = Pick<Item, 'summary' | 'platforms' | 'tags' | 'importance' | 'roles'>;

const SYSTEM_PROMPT = [
  'You enrich advertising-industry news for marketing practitioners. For every input item return:',
  `- summary: <=${ENRICH.summaryMaxChars} chars, factual, neutral, in your own words (never copy sentences), no hype, no emojis.`,
  `- platforms: subset of [${PLATFORMS.join(', ')}] the item is materially about; [] if none.`,
  `- tags: <=${ENRICH.maxTags} short lowercase topics (1-3 words), e.g. "attribution", "ctv", "privacy".`,
  '- importance: integer 1-5 for marketing practitioners (5 = major platform/policy change affecting most advertisers, 1 = minor or promotional).',
  `- roles: for each role, relevance 0-3 (0 irrelevant, 3 must-know) and soWhat: <=${ENRICH.soWhatMaxChars} chars, one concrete, actionable implication for that role, starting with a verb where natural; "" when relevance is 0.`,
  'Roles:',
  ...ROLES.map((role) => `- ${role}: ${ROLE_INFO[role].description}`),
  'Reply with JSON only, one entry per input item, keeping its "i":',
  '{"items":[{"i":0,"summary":"...","platforms":["meta"],"tags":["measurement"],"importance":3,"roles":{"performance":{"relevance":2,"soWhat":"..."},"ua":{"relevance":0,"soWhat":""},"brand":{"relevance":1,"soWhat":"..."}}}]}',
].join('\n');

export function buildEnrichMessages(items: readonly StoredItem[]): { role: 'system' | 'user'; content: string }[] {
  const payload = items.map((item, i) => ({
    i,
    section: item.section,
    source: item.source,
    title: item.title,
    text: truncate(item.snippet ?? item.summary, ENRICH.promptSnippetChars),
  }));
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: JSON.stringify({ items: payload }) },
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toInt(value: unknown): number | null {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : null;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Validates one LLM result and clamps it into the contract. Returns null when anything
 * required is missing or of the wrong type (the caller then keeps the fallback).
 */
export function parseEnrichment(raw: unknown): EnrichmentFields | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.summary !== 'string' || !collapseWhitespace(raw.summary)) return null;
  if (!Array.isArray(raw.platforms) || !Array.isArray(raw.tags)) return null;
  const importance = toInt(raw.importance);
  if (importance === null) return null;
  if (!isRecord(raw.roles)) return null;

  const roles = {} as Record<Role, RoleTake>;
  for (const role of ROLES) {
    const take = raw.roles[role];
    if (!isRecord(take)) return null;
    const relevance = toInt(take.relevance);
    if (relevance === null) return null;
    const soWhatRaw = take.soWhat ?? '';
    if (typeof soWhatRaw !== 'string') return null;
    const rel = clamp(relevance, 0, 3) as RoleTake['relevance'];
    roles[role] = { relevance: rel, soWhat: rel === 0 ? '' : truncate(soWhatRaw, ENRICH.soWhatMaxChars) };
  }

  const allowed = new Set<string>(PLATFORMS);
  const platformSet = new Set(
    raw.platforms.filter((p): p is string => typeof p === 'string').map((p) => p.trim().toLowerCase()).filter((p) => allowed.has(p)),
  );
  const tags: string[] = [];
  for (const tag of raw.tags) {
    if (typeof tag !== 'string') continue;
    const clean = collapseWhitespace(tag.toLowerCase()).replace(/^#/, '');
    if (!clean || clean.length > ENRICH.tagMaxChars || tags.includes(clean)) continue;
    tags.push(clean);
    if (tags.length === ENRICH.maxTags) break;
  }

  return {
    summary: truncate(raw.summary, ENRICH.summaryMaxChars),
    platforms: PLATFORMS.filter((p) => platformSet.has(p)),
    tags,
    importance: clamp(importance, 1, 5) as Item['importance'],
    roles,
  };
}

export interface EnrichReport {
  queued: number;
  requests: number;
  enriched: number;
  failed: number;
  skippedReason?: string;
}

/**
 * Enriches unenriched items in place, newest first, in batches of up to 12, at most 6 requests
 * per run. Items that stay unenriched keep their fallback fields and are retried in later runs
 * until they have had 3 attempts. Never throws because of the LLM.
 */
export async function enrichItems(items: StoredItem[], llm: LlmClient): Promise<EnrichReport> {
  const queue = items
    .filter((item) => !item.enriched && item.section !== 'creative' && item.attempts < ENRICH.maxAttempts)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id));
  const report: EnrichReport = { queued: queue.length, requests: 0, enriched: 0, failed: 0 };
  if (!llm.enabled) {
    report.skippedReason = 'LLM disabled';
    log('enrich', `skipped (${llm.disabledReason ?? 'LLM disabled'}); ${queue.length} items keep fallback fields`);
    return report;
  }

  for (let start = 0; start < queue.length && report.requests < ENRICH.maxRequestsPerRun; start += ENRICH.batchSize) {
    const batch = queue.slice(start, start + ENRICH.batchSize);
    report.requests++;
    const response = await llm.completeJson(buildEnrichMessages(batch), 'enrich');
    const results = new Map<number, unknown>();
    if (isRecord(response) && Array.isArray(response.items)) {
      for (const entry of response.items) {
        if (isRecord(entry)) {
          const i = toInt(entry.i);
          if (i !== null && !results.has(i)) results.set(i, entry);
        }
      }
    }
    let ok = 0;
    batch.forEach((item, i) => {
      item.attempts++;
      const fields = parseEnrichment(results.get(i));
      if (!fields) {
        report.failed++;
        return;
      }
      Object.assign(item, fields, { enriched: true });
      delete item.snippet;
      report.enriched++;
      ok++;
    });
    if (ok < batch.length) warn('enrich', `batch ${report.requests}: ${ok}/${batch.length} items valid, rest keep fallback`);
  }
  log('enrich', `queued=${report.queued} requests=${report.requests} enriched=${report.enriched} failed=${report.failed}`);
  return report;
}
