import { XMLParser } from 'fast-xml-parser';
import { INGEST, USER_AGENT } from './config.ts';
import type { SourceConfig } from './config.ts';
import { fallbackFields, isOffTopicTitle } from './enrich.ts';
import type { StoredItem } from './types.ts';
import type { FetchLike } from './util.ts';
import {
  DAY_MS, decodeEntities, errorMessage, log, mapLimit, parseFeedDate, parseHttpUrl, readBodyCapped, sha1Hex, stripControlChars, stripHtml,
  stripLinksAndMarkup, toIso, truncate, truncateToSentence, warn,
} from './util.ts';

/** One entry as parsed from a feed, before any filtering. */
export interface FeedEntry {
  title: string;
  /** Raw link as found in the feed (not yet validated). */
  link: string;
  publishedAt: Date | null;
  snippet: string;
  imageUrl?: string;
}

// ---------------------------------------------------------------------------
// Parsing

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  // Entities and CDATA are decoded by us (see textOf/stripHtml) so escaped HTML and
  // double-escaped WordPress titles are handled the same way everywhere.
  processEntities: false,
  htmlEntities: false,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  stopNodes: ['*.title', '*.description', '*.content:encoded', '*.content', '*.summary'],
});

type Node = Record<string, unknown>;

function isNode(value: unknown): value is Node {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** Removes CDATA markers (also a dangling one left by a length cap). */
function unwrapCdata(text: string): string {
  return text.replace(/<!\[CDATA\[|\]\]>/g, '');
}

/**
 * Raw text of a node (string, {#text}, or first array element), CDATA unwrapped, capped at `max`
 * characters before any regex work.
 */
function rawText(value: unknown, max: number): string {
  if (Array.isArray(value)) return rawText(value[0], max);
  if (typeof value === 'string') return unwrapCdata(value.slice(0, max));
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).slice(0, max);
  if (isNode(value) && value['#text'] !== undefined) return rawText(value['#text'], max);
  return '';
}

function attr(node: unknown, name: string): string {
  if (!isNode(node)) return '';
  const value = node[`@_${name}`];
  return typeof value === 'string' ? decodeEntities(value.slice(0, INGEST.maxRawLinkChars)).trim() : '';
}

function plain(value: unknown, max: number): string {
  return stripHtml(rawText(value, max));
}

const TITLE = INGEST.maxRawTitleChars;
const TEXT = INGEST.maxRawTextChars;
const LINK = INGEST.maxRawLinkChars;
const DATE = 200;

// Feed boilerplate at the end of snippets, removed repeatedly until none is left.
const TRAILERS: readonly RegExp[] = [
  /\s*The post\s.{1,300}?\s(?:appeared first|first appeared) on\s.{1,150}?$/i,
  /\s*(?:This|The) (?:article|post|story|piece) (?:was )?(?:originally|first) (?:appeared|published|posted|ran)\b.{0,200}$/i,
  /\s*(?:Originally|First) (?:published|posted|appeared) (?:on|in|at|by)\b.{0,200}$/i,
  /\s*\[(?:…|\.\.\.)\]$/,
  /\s*(?:Continue reading|Keep reading|Read more|Read the full (?:story|article|post)|Learn more)\b.{0,80}$/i,
  /(?<=^|[.!?…"”’)\]])\s*More\s*[»›→]*$/,
  /\s*[»›→]+$/,
];

/** Feed text is untrusted: no control characters, no URLs, links or markup survive into our output. */
function cleanUntrusted(text: string): string {
  return stripLinksAndMarkup(stripControlChars(text));
}

/** Plain-text snippet: boilerplate tails removed, cut at the last full sentence within 600 chars. */
export function cleanSnippet(text: string): string {
  // Only the start matters for a 600-char snippet; cap before the regex passes.
  let out = cleanUntrusted(text.slice(0, INGEST.snippetMaxChars * 4));
  let previous = '';
  while (out !== previous) {
    previous = out;
    for (const pattern of TRAILERS) out = out.replace(pattern, '').trim();
  }
  return truncateToSentence(out, INGEST.snippetMaxChars);
}

function isImageUrl(url: string): boolean {
  return /\.(?:jpe?g|png|gif|webp|avif)(?:[?#]|$)/i.test(url);
}

/** Feed-provided image: media:content, media:thumbnail (also inside media:group) or an image enclosure. */
function pickImage(node: Node): string | undefined {
  const groups = asArray(node['media:group']).filter(isNode);
  const contents = [node, ...groups].flatMap((n) => asArray(n['media:content']));
  for (const content of contents) {
    const url = attr(content, 'url');
    const medium = attr(content, 'medium').toLowerCase();
    const type = attr(content, 'type').toLowerCase();
    if (url && (medium === 'image' || type.startsWith('image/') || (!medium && !type && isImageUrl(url)))) return url;
  }
  const thumbs = [node, ...groups].flatMap((n) => asArray(n['media:thumbnail']));
  for (const thumb of thumbs) {
    const url = attr(thumb, 'url');
    if (url) return url;
  }
  for (const enclosure of asArray(node.enclosure)) {
    const url = attr(enclosure, 'url');
    if (url && attr(enclosure, 'type').toLowerCase().startsWith('image/')) return url;
  }
  return undefined;
}

function rssEntry(item: Node): FeedEntry {
  let link = decodeEntities(rawText(item.link, LINK)).trim();
  if (!link) {
    const guid = item.guid;
    const permalink = attr(guid, 'isPermaLink').toLowerCase() !== 'false';
    const guidText = decodeEntities(rawText(guid, LINK)).trim();
    if (permalink && /^https?:\/\//i.test(guidText)) link = guidText;
  }
  if (!link) link = atomLink(item['atom:link']);
  const date = rawText(item.pubDate, DATE) || rawText(item['dc:date'], DATE) || rawText(item.published, DATE)
    || rawText(item.updated, DATE) || rawText(item['atom:updated'], DATE);
  const description = plain(item.description, TEXT);
  const snippet = description || plain(item['content:encoded'], TEXT);
  return { title: plain(item.title, TITLE), link, publishedAt: parseFeedDate(date), snippet: cleanSnippet(snippet), imageUrl: pickImage(item) };
}

function atomLink(links: unknown): string {
  const candidates = asArray(links).filter(isNode);
  const byPreference = [
    candidates.find((l) => (attr(l, 'rel') || 'alternate') === 'alternate' && (!attr(l, 'type') || attr(l, 'type') === 'text/html')),
    candidates.find((l) => (attr(l, 'rel') || 'alternate') === 'alternate'),
    candidates[0],
  ];
  for (const candidate of byPreference) {
    const href = attr(candidate, 'href');
    if (href) return href;
  }
  return '';
}

function atomEntry(entry: Node): FeedEntry {
  const date = rawText(entry.published, DATE) || rawText(entry.updated, DATE);
  const snippet = plain(entry.summary, TEXT) || plain(entry.content, TEXT);
  return { title: plain(entry.title, TITLE), link: atomLink(entry.link), publishedAt: parseFeedDate(date), snippet: cleanSnippet(snippet), imageUrl: pickImage(entry) };
}

/** First 200 entries only, before any per-item processing. */
function firstEntries(value: unknown): Node[] {
  return asArray(value).slice(0, INGEST.maxItemsPerFeed).filter(isNode);
}

/**
 * Parses RSS 2.0, RSS 1.0 (RDF) and Atom documents. Throws on anything else. Entity processing is
 * off in the XML parser (no DOCTYPE/entity expansion, so "billion laughs" cannot blow up); we
 * decode standard XML/HTML and numeric entities ourselves on bounded strings.
 */
export function parseFeed(xml: string): FeedEntry[] {
  const doc = parser.parse(xml) as unknown;
  if (!isNode(doc)) throw new Error('empty document');
  if (isNode(doc.rss)) {
    const channel = asArray(doc.rss.channel).find(isNode);
    return firstEntries(channel?.item).map(rssEntry);
  }
  if (isNode(doc.feed)) {
    return firstEntries(doc.feed.entry).map(atomEntry);
  }
  const rdf = doc['rdf:RDF'];
  if (isNode(rdf)) {
    return firstEntries(rdf.item).map(rssEntry);
  }
  throw new Error('not an RSS or Atom document');
}

// ---------------------------------------------------------------------------
// URLs, ids, titles

const TRACKING_PARAM = /^(?:utm_.*|fbclid|gclid)$/i;

/**
 * Canonical form used for ids and published links: absolute http(s) only (anything else → null),
 * without utm_* / fbclid / gclid parameters and without the fragment.
 */
export function canonicalizeUrl(raw: string): string | null {
  const url = parseHttpUrl(raw);
  if (!url) return null;
  url.hash = '';
  const tracking = [...url.searchParams.keys()].filter((key) => TRACKING_PARAM.test(key));
  for (const key of new Set(tracking)) url.searchParams.delete(key);
  return url.toString();
}

export function itemId(canonicalUrl: string): string {
  return sha1Hex(canonicalUrl).slice(0, 12);
}

export function normalizeTitle(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/['‘’`"“”]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/['‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function urlSlug(url: string): string {
  try {
    const last = new URL(url).pathname.split('/').filter(Boolean).pop() ?? '';
    return decodeURIComponent(last).toLowerCase().replace(/\.(?:html?|php|aspx?)$/, '');
  } catch {
    return '';
  }
}

// Common headline verbs; a glossary title ("Cost per order", "Deals API") has none of them.
const HEADLINE_VERBS = new Set([
  'is', 'are', 'was', 'were', 'be', 'has', 'have', 'had', 'will', 'can', 'could', 'may', 'must', 'should', 'does', 'do', 'did',
  'get', 'gets', 'add', 'adds', 'launch', 'launches', 'expand', 'expands', 'roll', 'rolls', 'introduce', 'introduces', 'announce',
  'announces', 'buy', 'buys', 'acquire', 'acquires', 'raise', 'raises', 'cut', 'cuts', 'drop', 'drops', 'end', 'ends', 'hit', 'hits',
  'sue', 'sues', 'ban', 'bans', 'win', 'wins', 'lose', 'loses', 'beat', 'beats', 'top', 'tops', 'join', 'joins', 'hire', 'hires',
  'say', 'says', 'said', 'open', 'opens', 'close', 'closes', 'test', 'tests', 'pause', 'pauses', 'delay', 'delays', 'sell', 'sells',
  'plan', 'plans', 'make', 'makes', 'take', 'takes', 'give', 'gives', 'let', 'lets', 'bring', 'brings', 'move', 'moves', 'set',
  'sets', 'update', 'updates', 'change', 'changes', 'require', 'requires', 'reach', 'reaches', 'grow', 'grows', 'fall', 'falls',
  'rise', 'rises', 'warn', 'warns', 'unveil', 'unveils', 'debut', 'debuts', 'ship', 'ships', 'retire', 'retires', 'sunset',
  'sunsets', 'deprecate', 'deprecates', 'sign', 'signs', 'settle', 'settles', 'face', 'faces', 'fine', 'fines', 'need', 'needs',
  'want', 'wants', 'show', 'shows', 'find', 'finds', 'turn', 'turns', 'build', 'builds', 'kill', 'kills', 'quit', 'quits', 'files',
]);

function hasHeadlineVerb(title: string): boolean {
  return title
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z-]/g, ''))
    .some((token) => {
      if (token.includes('-')) return token.split('-').some((part) => HEADLINE_VERBS.has(part)); // "value-based" is not a verb
      return HEADLINE_VERBS.has(token) || (token.length >= 5 && /[^e]ed$/.test(token));
    });
}

/**
 * Glossary/definition pages (PPC Land publishes many): a title of at most 4 words with no headline
 * verb, whose URL slug is exactly the slugified title. Real news slugs also follow the title, so
 * the word count and verb checks are what keep news in.
 */
export function isGlossaryEntry(title: string, url: string): boolean {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 4 || hasHeadlineVerb(title)) return false;
  const slug = slugify(title);
  return slug !== '' && urlSlug(url) === slug;
}

/** Puzzle posts such as "Game: ...". */
export function isPuzzleTitle(title: string): boolean {
  return /^game\s*:/i.test(title.trim());
}

function sourceDayKey(item: { source: string; publishedAt: string }): string {
  return `${item.source}|${item.publishedAt.slice(0, 10)}`;
}

type Rankable = { id: string; source: string; publishedAt: string };

export function mostRecentFirst(a: Rankable, b: Rankable): number {
  return b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id);
}

/**
 * Keeps at most `cap` items per (source, UTC day of publishedAt), chosen by `rank`. `taken` holds
 * slots already used per "source|day" (for example by items already in state). Input order is kept.
 */
export function capPerSourceDay<T extends Rankable>(items: readonly T[], cap: number, rank: (a: T, b: T) => number, taken: ReadonlyMap<string, number> = new Map()): T[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = sourceDayKey(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  const keep = new Set<T>();
  for (const [key, group] of groups) {
    const room = Math.max(0, cap - (taken.get(key) ?? 0));
    for (const item of [...group].sort(rank).slice(0, room)) keep.add(item);
  }
  return items.filter((item) => keep.has(item));
}

/**
 * Removes duplicates by id (same canonical URL) and by normalized title, keeping the earliest
 * published item. Ties keep the first occurrence (stable).
 */
export function dedupeItems<T extends { id: string; title: string; publishedAt: string }>(items: readonly T[]): T[] {
  const ordered = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => a.item.publishedAt.localeCompare(b.item.publishedAt) || a.index - b.index);
  const ids = new Set<string>();
  const titles = new Set<string>();
  const kept: T[] = [];
  for (const { item } of ordered) {
    const title = normalizeTitle(item.title);
    if (ids.has(item.id) || (title && titles.has(title))) continue;
    ids.add(item.id);
    if (title) titles.add(title);
    kept.push(item);
  }
  return kept;
}

/**
 * Adds incoming items that are not already in state (by id or normalized title).
 * Existing items always win: they were seen first and may already be enriched.
 * Each source gets at most 12 items per UTC day in state; when new items would exceed that, the
 * most recent ones are kept.
 */
export function mergeNewItems(existing: readonly StoredItem[], incoming: readonly StoredItem[]): { items: StoredItem[]; added: StoredItem[]; capped: number } {
  const ids = new Set(existing.map((item) => item.id));
  const titles = new Set(existing.map((item) => normalizeTitle(item.title)).filter(Boolean));
  const fresh: StoredItem[] = [];
  for (const item of dedupeItems(incoming)) {
    const title = normalizeTitle(item.title);
    if (ids.has(item.id) || (title && titles.has(title))) continue;
    ids.add(item.id);
    if (title) titles.add(title);
    fresh.push(item);
  }
  const taken = new Map<string, number>();
  for (const item of existing) taken.set(sourceDayKey(item), (taken.get(sourceDayKey(item)) ?? 0) + 1);
  const added = capPerSourceDay(fresh, INGEST.maxPerSourcePerDay, mostRecentFirst, taken);
  return { items: [...existing, ...added], added, capped: fresh.length - added.length };
}

// ---------------------------------------------------------------------------
// Entries → items

export interface EntryStats { parsed: number; kept: number; noLink: number; noDate: number; old: number; noTitle: number; offTopic: number; nonNews: number }

/** Turns parsed entries into fallback-enriched items; keeps only the last 7 days. */
export function entriesToItems(entries: readonly FeedEntry[], source: SourceConfig, now: Date): { items: StoredItem[]; stats: EntryStats } {
  const stats: EntryStats = { parsed: entries.length, kept: 0, noLink: 0, noDate: 0, old: 0, noTitle: 0, offTopic: 0, nonNews: 0 };
  const minTime = now.getTime() - INGEST.maxAgeDays * DAY_MS;
  const items: StoredItem[] = [];
  for (const entry of entries) {
    const url = canonicalizeUrl(entry.link);
    if (!url) {
      stats.noLink++;
      continue;
    }
    const title = truncate(cleanUntrusted(entry.title), INGEST.titleMaxChars);
    if (!title) {
      stats.noTitle++;
      continue;
    }
    if (isOffTopicTitle(title)) {
      stats.offTopic++;
      continue;
    }
    // Glossary pages and puzzles are not news. The glossary rule is limited to news sources:
    // expert blogs (e.g. Seth Godin) legitimately use short noun-phrase titles with title slugs.
    if (isPuzzleTitle(title) || (source.section === 'news' && isGlossaryEntry(title, url))) {
      stats.nonNews++;
      continue;
    }
    if (!entry.publishedAt) {
      stats.noDate++;
      continue;
    }
    if (entry.publishedAt.getTime() < minTime) {
      stats.old++;
      continue;
    }
    const published = entry.publishedAt.getTime() > now.getTime() ? now : entry.publishedAt;
    const item: StoredItem = {
      id: itemId(url),
      section: source.section,
      title,
      url,
      source: source.name,
      publishedAt: toIso(published),
      ...fallbackFields(title, entry.snippet, source),
      snippet: entry.snippet,
      attempts: 0,
      ingestedAt: toIso(now),
    };
    const image = parseHttpUrl(entry.imageUrl ?? '');
    if (image) item.imageUrl = image.toString();
    items.push(item);
    stats.kept++;
  }
  return { items, stats };
}

// ---------------------------------------------------------------------------
// Fetching

export interface FeedReport {
  source: string;
  section: SourceConfig['section'];
  ok: boolean;
  status?: number;
  parsed: number;
  recent: number;
  error?: string;
  ms: number;
}

export interface FetchLimits { timeoutMs: number; maxBytes: number }

const FEED_LIMITS: FetchLimits = { timeoutMs: INGEST.timeoutMs, maxBytes: INGEST.maxFeedBytes };

/**
 * Fetches a feed with a single deadline covering headers and body, and a hard 5 MB body cap
 * (checked against Content-Length first, then while streaming). Over the cap → error, feed skipped.
 */
export async function fetchFeedText(url: string, fetchImpl: FetchLike, limits: FetchLimits = FEED_LIMITS): Promise<{ status: number; text: string }> {
  const signal = AbortSignal.timeout(limits.timeoutMs);
  const res = await fetchImpl(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.9, */*;q=0.5',
    },
    redirect: 'follow',
    signal,
  });
  if (!res.ok) {
    await res.body?.cancel().catch(() => undefined);
    throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  }
  const text = await readBodyCapped(res, limits.maxBytes, signal);
  return { status: res.status, text };
}

export interface IngestResult { items: StoredItem[]; reports: FeedReport[] }

/** Fetches every source with limited concurrency. Per-feed failures are logged and skipped. */
export async function ingestAll(sources: readonly SourceConfig[], options: { fetch?: FetchLike; now: Date }): Promise<IngestResult> {
  const fetchImpl: FetchLike = options.fetch ?? ((input, init) => fetch(input, init));
  const perSource = await mapLimit(sources, INGEST.concurrency, async (source) => {
    const started = Date.now();
    const report: FeedReport = { source: source.name, section: source.section, ok: false, parsed: 0, recent: 0, ms: 0 };
    try {
      const { status, text } = await fetchFeedText(source.feedUrl, fetchImpl);
      report.status = status;
      const entries = parseFeed(text);
      const { items, stats } = entriesToItems(entries, source, options.now);
      report.ok = true;
      report.parsed = stats.parsed;
      report.recent = stats.kept;
      if (stats.parsed === 0) warn('ingest', `${source.name}: feed parsed but has no entries`);
      if (stats.noLink || stats.noDate) warn('ingest', `${source.name}: dropped ${stats.noLink} without a valid http(s) link, ${stats.noDate} without a date`);
      if (stats.offTopic) log('ingest', `${source.name}: skipped ${stats.offTopic} off-topic (ratings/box office) items`);
      if (stats.nonNews) log('ingest', `${source.name}: skipped ${stats.nonNews} glossary/puzzle entries`);
      return { items, report };
    } catch (err) {
      const status = (err as { status?: unknown }).status;
      if (typeof status === 'number') report.status = status;
      report.error = errorMessage(err);
      warn('ingest', `${source.name}: ${report.error}`);
      return { items: [] as StoredItem[], report };
    } finally {
      report.ms = Date.now() - started;
    }
  });
  const items = dedupeItems(perSource.flatMap((r) => r.items));
  const reports = perSource.map((r) => r.report);
  const okCount = reports.filter((r) => r.ok).length;
  log('ingest', `${okCount}/${sources.length} feeds ok, ${items.length} recent items after dedupe`);
  return { items, reports };
}
