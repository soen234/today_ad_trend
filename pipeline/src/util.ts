import { createHash } from 'node:crypto';

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export function sha1Hex(text: string): string {
  return createHash('sha1').update(text).digest('hex');
}

// ---------------------------------------------------------------------------
// URLs

/**
 * Security rule: every URL we publish must be an absolute http: or https: URL. Feed links are
 * third-party input, so `javascript:`, `data:`, other app schemes and relative links are rejected.
 * Returns the parsed URL, or null when the value fails the rule.
 */
export function parseHttpUrl(value: unknown): URL | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed); // no base: relative URLs throw
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!url.hostname) return null;
  return url;
}

export function isHttpUrl(value: unknown): value is string {
  return parseHttpUrl(value) !== null;
}

// ---------------------------------------------------------------------------
// Text

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', sbquo: '‚', bdquo: '„', laquo: '«', raquo: '»',
  trade: '™', reg: '®', copy: '©', bull: '•', middot: '·', deg: '°', euro: '€', pound: '£', yen: '¥',
  cent: '¢', times: '×', divide: '÷', eacute: 'é', egrave: 'è', aacute: 'á', agrave: 'à', iacute: 'í',
  oacute: 'ó', uacute: 'ú', ntilde: 'ñ', ccedil: 'ç', ouml: 'ö', uuml: 'ü', auml: 'ä', szlig: 'ß',
  thinsp: ' ', ensp: ' ', emsp: ' ', zwj: '', zwnj: '', shy: '',
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (match, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    return named ?? match;
  });
}

export function collapseWhitespace(text: string): string {
  return text.replace(/[\s ​]+/g, ' ').trim();
}

/**
 * Converts (possibly entity-escaped) HTML to plain text: decode, drop scripts/styles/comments,
 * drop tags, decode again (feeds often double-escape), collapse whitespace.
 */
export function stripHtml(html: string): string {
  let text = decodeEntities(html);
  text = text.replace(/<!--[\s\S]*?-->/g, ' ');
  text = text.replace(/<(script|style|noscript|figure|figcaption)\b[\s\S]*?<\/\1\s*>/gi, ' ');
  text = text.replace(/<\/?[a-z][^>]*>/gi, ' ');
  text = decodeEntities(text);
  // Tags were replaced by spaces; do not leave "word ." behind.
  return collapseWhitespace(text).replace(/\s+([.,;:!?)\]])/g, '$1');
}

/** Truncates to at most `max` characters, preferring a word boundary, ending with "…". */
export function truncate(text: string, max: number): string {
  const clean = collapseWhitespace(text);
  if (clean.length <= max) return clean;
  const hard = clean.slice(0, Math.max(0, max - 1));
  const lastSpace = hard.lastIndexOf(' ');
  const cut = lastSpace >= Math.floor(max * 0.6) ? hard.slice(0, lastSpace) : hard;
  return `${cut.replace(/[\s.,;:!?\-–—]+$/u, '')}…`;
}

// ---------------------------------------------------------------------------
// Dates (everything is UTC)

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** ISO 8601 UTC without milliseconds, e.g. 2026-10-25T21:00:00Z. */
export function toIso(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** YYYY-MM-DD of the UTC calendar date. */
export function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isYmd(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && ymd(d) === value;
}

export function addDays(dateYmd: string, days: number): string {
  const d = new Date(`${dateYmd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return ymd(d);
}

export const HOUR_MS = 3_600_000;
export const DAY_MS = 24 * HOUR_MS;

const HAS_ZONE = /(?:Z|[+-]\d{2}:?\d{2}|\b(?:GMT|UTC|UT|[ECMP][SD]T))\s*$/i;

/**
 * Parses RSS (RFC 822), Atom (ISO 8601) and loose dates such as "October 22, 2026".
 * Strings without a time zone are read as UTC so the result never depends on the host TZ.
 */
export function parseFeedDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const value = collapseWhitespace(raw);
  if (!value) return null;
  if (ISO_DATE.test(value)) {
    const d = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const hasZone = HAS_ZONE.test(value) || /T\d{2}:\d{2}.*(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  const candidates = hasZone ? [value] : [`${value} UTC`, `${value}Z`, value];
  for (const candidate of candidates) {
    const t = Date.parse(candidate);
    if (!Number.isNaN(t)) return new Date(t);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Async helpers

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Runs `fn` over `items` with at most `limit` in flight; results keep input order. */
export async function mapLimit<T, R>(items: readonly T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index] as T, index);
    }
  });
  await Promise.all(workers);
  return results;
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    const cause = err.cause instanceof Error ? ` (${err.cause.message})` : '';
    return `${err.name === 'Error' ? '' : `${err.name}: `}${err.message}${cause}`;
  }
  return String(err);
}

export function log(scope: string, message: string): void {
  console.log(`[${scope}] ${message}`);
}

export function warn(scope: string, message: string): void {
  console.warn(`[${scope}] WARN ${message}`);
}
