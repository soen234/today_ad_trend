import { XMLParser } from 'fast-xml-parser';
import { INGEST, USER_AGENT } from './config.ts';
import type { SourceConfig } from './config.ts';
import { fallbackFields, isOffTopicTitle } from './enrich.ts';
import type { StoredItem } from './types.ts';
import type { FetchLike } from './util.ts';
import {
  DAY_MS, decodeEntities, errorMessage, log, mapLimit, parseFeedDate, parseHttpUrl, sha1Hex, stripControlChars, stripHtml,
  stripLinksAndMarkup, toIso, truncate, warn,
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

function unwrapCdata(text: string): string {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

/** Raw text of a node (string, {#text}, or first array element), CDATA unwrapped. */
function rawText(value: unknown): string {
  if (Array.isArray(value)) return rawText(value[0]);
  if (typeof value === 'string') return unwrapCdata(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (isNode(value) && value['#text'] !== undefined) return rawText(value['#text']);
  return '';
}

function attr(node: unknown, name: string): string {
  if (!isNode(node)) return '';
  const value = node[`@_${name}`];
  return typeof value === 'string' ? decodeEntities(value).trim() : '';
}

function plain(value: unknown): string {
  return stripHtml(rawText(value));
}

const TRAILERS = [
  /\s*The post .{1,300}? appeared first on .{1,120}?$/i,
  /\s*\[(?:…|\.\.\.|&hellip;)\]\s*$/,
  /\s*(?:Continue reading|Read more)\b.{0,120}$/i,
];

/** Feed text is untrusted: no control characters, no URLs, links or markup survive into our output. */
function cleanUntrusted(text: string): string {
  return stripLinksAndMarkup(stripControlChars(text));
}

function cleanSnippet(text: string): string {
  let out = cleanUntrusted(text);
  for (const pattern of TRAILERS) out = out.replace(pattern, '');
  return truncate(out, INGEST.snippetMaxChars);
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
  let link = decodeEntities(rawText(item.link)).trim();
  if (!link) {
    const guid = item.guid;
    const permalink = attr(guid, 'isPermaLink').toLowerCase() !== 'false';
    const guidText = decodeEntities(rawText(guid)).trim();
    if (permalink && /^https?:\/\//i.test(guidText)) link = guidText;
  }
  if (!link) link = atomLink(item['atom:link']);
  const date = rawText(item.pubDate) || rawText(item['dc:date']) || rawText(item.published) || rawText(item.updated) || rawText(item['atom:updated']);
  const description = plain(item.description);
  const snippet = description || plain(item['content:encoded']);
  return { title: plain(item.title), link, publishedAt: parseFeedDate(date), snippet: cleanSnippet(snippet), imageUrl: pickImage(item) };
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
  const date = rawText(entry.published) || rawText(entry.updated);
  const snippet = plain(entry.summary) || plain(entry.content);
  return { title: plain(entry.title), link: atomLink(entry.link), publishedAt: parseFeedDate(date), snippet: cleanSnippet(snippet), imageUrl: pickImage(entry) };
}

/** Parses RSS 2.0, RSS 1.0 (RDF) and Atom documents. Throws on anything else. */
export function parseFeed(xml: string): FeedEntry[] {
  const doc = parser.parse(xml) as unknown;
  if (!isNode(doc)) throw new Error('empty document');
  if (isNode(doc.rss)) {
    const channel = asArray(doc.rss.channel).find(isNode);
    return asArray(channel?.item).filter(isNode).map(rssEntry);
  }
  if (isNode(doc.feed)) {
    return asArray(doc.feed.entry).filter(isNode).map(atomEntry);
  }
  const rdf = doc['rdf:RDF'];
  if (isNode(rdf)) {
    return asArray(rdf.item).filter(isNode).map(rssEntry);
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
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['‘’`"“”]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
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
 */
export function mergeNewItems(existing: readonly StoredItem[], incoming: readonly StoredItem[]): { items: StoredItem[]; added: StoredItem[] } {
  const ids = new Set(existing.map((item) => item.id));
  const titles = new Set(existing.map((item) => normalizeTitle(item.title)).filter(Boolean));
  const added: StoredItem[] = [];
  for (const item of dedupeItems(incoming)) {
    const title = normalizeTitle(item.title);
    if (ids.has(item.id) || (title && titles.has(title))) continue;
    ids.add(item.id);
    if (title) titles.add(title);
    added.push(item);
  }
  return { items: [...existing, ...added], added };
}

// ---------------------------------------------------------------------------
// Entries → items

export interface EntryStats { parsed: number; kept: number; noLink: number; noDate: number; old: number; noTitle: number; offTopic: number }

/** Turns parsed entries into fallback-enriched items; keeps only the last 7 days. */
export function entriesToItems(entries: readonly FeedEntry[], source: SourceConfig, now: Date): { items: StoredItem[]; stats: EntryStats } {
  const stats: EntryStats = { parsed: entries.length, kept: 0, noLink: 0, noDate: 0, old: 0, noTitle: 0, offTopic: 0 };
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

export async function fetchFeedText(url: string, fetchImpl: FetchLike): Promise<{ status: number; text: string }> {
  const res = await fetchImpl(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.9, */*;q=0.5',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(INGEST.timeoutMs),
  });
  const text = await res.text();
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
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
