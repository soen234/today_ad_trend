import { EDITION, ENRICH, FEED, INGEST, PLATFORMS, PULSE, ROLES, SECTIONS } from './config.ts';
import { LATEST_PATH, PULSE_PATH, type Outputs } from './publish.ts';
import type { Role, Section } from './types.ts';
import { isHttpUrl, isYmd } from './util.ts';

// Runtime validation of every /v1 file against the contract (spec §4). Unknown keys are errors,
// so internal state fields can never leak, and every URL must be an absolute http(s) URL.

type Rec = Record<string, unknown>;

class Errors {
  readonly list: string[] = [];
  add(at: string, message: string): void {
    this.list.push(`${at}: ${message}`);
  }
}

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

function isRecord(value: unknown): value is Rec {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoUtc(value: unknown): boolean {
  return typeof value === 'string' && ISO_UTC.test(value) && !Number.isNaN(Date.parse(value));
}

function isInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function checkKeys(errors: Errors, at: string, value: Rec, required: readonly string[], optional: readonly string[] = []): void {
  for (const key of required) if (!(key in value)) errors.add(at, `missing "${key}"`);
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) if (!allowed.has(key)) errors.add(at, `unexpected key "${key}"`);
}

function checkUrl(errors: Errors, at: string, value: unknown): void {
  if (!isHttpUrl(value)) errors.add(at, `must be an absolute http(s) URL, got ${JSON.stringify(value)?.slice(0, 80)}`);
}

const ITEM_KEYS = ['id', 'section', 'title', 'url', 'source', 'publishedAt', 'summary', 'platforms', 'tags', 'importance', 'roles', 'enriched'];

function validateItem(errors: Errors, at: string, item: unknown): void {
  if (!isRecord(item)) {
    errors.add(at, 'must be an object');
    return;
  }
  checkKeys(errors, at, item, ITEM_KEYS, ['imageUrl']);
  if (typeof item.id !== 'string' || !/^[0-9a-f]{12}$/.test(item.id)) errors.add(`${at}.id`, 'must be 12 lowercase hex chars');
  if (!SECTIONS.includes(item.section as Section)) errors.add(`${at}.section`, 'unknown section');
  if (!isText(item.title, INGEST.titleMaxChars)) errors.add(`${at}.title`, `must be non-empty, <= ${INGEST.titleMaxChars} chars`);
  checkUrl(errors, `${at}.url`, item.url);
  if (!isText(item.source, 120)) errors.add(`${at}.source`, 'must be a non-empty string');
  if (!isIsoUtc(item.publishedAt)) errors.add(`${at}.publishedAt`, 'must be ISO 8601 UTC');
  if (!isText(item.summary, ENRICH.summaryMaxChars)) errors.add(`${at}.summary`, `must be non-empty, <= ${ENRICH.summaryMaxChars} chars`);
  const platforms = item.platforms;
  if (!Array.isArray(platforms) || platforms.some((p) => !PLATFORMS.includes(p as never)) || new Set(platforms).size !== platforms.length) {
    errors.add(`${at}.platforms`, 'must be unique values from the platform list');
  }
  const tags = item.tags;
  if (
    !Array.isArray(tags) || tags.length > ENRICH.maxTags || new Set(tags).size !== tags.length
    || tags.some((t) => !isText(t, ENRICH.tagMaxChars) || t !== (t as string).toLowerCase())
  ) {
    errors.add(`${at}.tags`, `must be <= ${ENRICH.maxTags} unique short lowercase strings`);
  }
  if (!isInt(item.importance, 1, 5)) errors.add(`${at}.importance`, 'must be an integer 1-5');
  if (!isRecord(item.roles)) errors.add(`${at}.roles`, 'must be an object');
  else {
    checkKeys(errors, `${at}.roles`, item.roles, ROLES);
    for (const role of ROLES) {
      const take = item.roles[role];
      const where = `${at}.roles.${role}`;
      if (!isRecord(take)) continue;
      checkKeys(errors, where, take, ['relevance', 'soWhat']);
      if (!isInt(take.relevance, 0, 3)) errors.add(`${where}.relevance`, 'must be an integer 0-3');
      if (typeof take.soWhat !== 'string' || take.soWhat.length > ENRICH.soWhatMaxChars) errors.add(`${where}.soWhat`, `must be a string <= ${ENRICH.soWhatMaxChars} chars`);
      else if (take.relevance === 0 && take.soWhat !== '') errors.add(`${where}.soWhat`, 'must be empty when relevance is 0');
    }
  }
  if ('imageUrl' in item) checkUrl(errors, `${at}.imageUrl`, item.imageUrl);
  if (typeof item.enriched !== 'boolean') errors.add(`${at}.enriched`, 'must be a boolean');
}

function checkUniqueIds(errors: Errors, at: string, items: unknown[]): void {
  const ids = items.map((i) => (isRecord(i) ? i.id : undefined));
  if (new Set(ids).size !== ids.length) errors.add(at, 'item ids must be unique');
}

function validateEdition(errors: Errors, at: string, value: unknown, expected?: { date: string; role: Role }): void {
  if (!isRecord(value)) {
    errors.add(at, 'must be an object');
    return;
  }
  checkKeys(errors, at, value, ['version', 'date', 'role', 'generatedAt', 'headline', 'items']);
  if (value.version !== 1) errors.add(`${at}.version`, 'must be 1');
  if (typeof value.date !== 'string' || !isYmd(value.date)) errors.add(`${at}.date`, 'must be YYYY-MM-DD');
  if (!ROLES.includes(value.role as Role)) errors.add(`${at}.role`, 'unknown role');
  if (expected && (value.date !== expected.date || value.role !== expected.role)) errors.add(at, 'date/role do not match the file path');
  if (!isIsoUtc(value.generatedAt)) errors.add(`${at}.generatedAt`, 'must be ISO 8601 UTC');
  if (!isText(value.headline, EDITION.headlineMaxChars)) errors.add(`${at}.headline`, `must be non-empty, <= ${EDITION.headlineMaxChars} chars`);
  if (!Array.isArray(value.items) || value.items.length < EDITION.min || value.items.length > EDITION.max) {
    errors.add(`${at}.items`, `must have ${EDITION.min}-${EDITION.max} items`);
  }
  if (Array.isArray(value.items)) {
    value.items.forEach((item, i) => validateItem(errors, `${at}.items[${i}]`, item));
    checkUniqueIds(errors, `${at}.items`, value.items);
  }
}

function validateFeed(errors: Errors, at: string, value: unknown, section: Section): void {
  if (!isRecord(value)) {
    errors.add(at, 'must be an object');
    return;
  }
  checkKeys(errors, at, value, ['version', 'generatedAt', 'items']);
  if (value.version !== 1) errors.add(`${at}.version`, 'must be 1');
  if (!isIsoUtc(value.generatedAt)) errors.add(`${at}.generatedAt`, 'must be ISO 8601 UTC');
  const items = value.items;
  if (!Array.isArray(items)) {
    errors.add(`${at}.items`, 'must be an array');
    return;
  }
  if (items.length > FEED.maxItems) errors.add(`${at}.items`, `must have <= ${FEED.maxItems} items`);
  items.forEach((item: unknown, i) => {
    validateItem(errors, `${at}.items[${i}]`, item);
    if (isRecord(item) && item.section !== section) errors.add(`${at}.items[${i}].section`, `must be "${section}"`);
    const prev: unknown = items[i - 1];
    if (isRecord(prev) && isRecord(item) && String(prev.publishedAt) < String(item.publishedAt)) errors.add(`${at}.items`, 'must be newest first');
  });
  checkUniqueIds(errors, `${at}.items`, items);
}

function validateStats(errors: Errors, at: string, value: unknown): void {
  if (!Array.isArray(value)) {
    errors.add(at, 'must be an array');
    return;
  }
  value.forEach((stat, i) => {
    const where = `${at}[${i}]`;
    if (!isRecord(stat)) {
      errors.add(where, 'must be an object');
      return;
    }
    checkKeys(errors, where, stat, ['label', 'share', 'deltaPt']);
    if (!isText(stat.label, 60)) errors.add(`${where}.label`, 'must be a non-empty string');
    if (typeof stat.share !== 'number' || !(stat.share >= 0 && stat.share <= 1)) errors.add(`${where}.share`, 'must be 0..1');
    if (typeof stat.deltaPt !== 'number' || !Number.isFinite(stat.deltaPt) || Math.abs(stat.deltaPt) > 100) errors.add(`${where}.deltaPt`, 'must be a number of points within ±100');
  });
}

function validatePulse(errors: Errors, at: string, value: unknown): void {
  if (!isRecord(value)) {
    errors.add(at, 'must be an object');
    return;
  }
  checkKeys(errors, at, value, ['version', 'generatedAt', 'weekStart', 'weekEnd', 'sample', 'formatMix', 'audienceSignals', 'topLaunchers', 'longRunners', 'insights']);
  if (value.version !== 1) errors.add(`${at}.version`, 'must be 1');
  if (!isIsoUtc(value.generatedAt)) errors.add(`${at}.generatedAt`, 'must be ISO 8601 UTC');
  const datesOk = typeof value.weekStart === 'string' && isYmd(value.weekStart) && typeof value.weekEnd === 'string' && isYmd(value.weekEnd);
  if (!datesOk || String(value.weekStart) > String(value.weekEnd)) errors.add(`${at}.weekStart/weekEnd`, 'must be YYYY-MM-DD with weekStart <= weekEnd');

  const sample = value.sample;
  if (!isRecord(sample)) errors.add(`${at}.sample`, 'must be an object');
  else {
    checkKeys(errors, `${at}.sample`, sample, ['shards', 'totalShards', 'creatives', 'newThisWeek', 'newPriorWeek']);
    const big = Number.MAX_SAFE_INTEGER;
    if (!isInt(sample.shards, 1, big)) errors.add(`${at}.sample.shards`, 'must be an integer >= 1');
    if (!isInt(sample.totalShards, 1, big) || (sample.totalShards as number) < (sample.shards as number)) errors.add(`${at}.sample.totalShards`, 'must be an integer >= shards');
    if (!isInt(sample.creatives, 0, big)) errors.add(`${at}.sample.creatives`, 'must be a non-negative integer');
    for (const key of ['newThisWeek', 'newPriorWeek'] as const) {
      if (!isInt(sample[key], 0, big) || (sample[key] as number) > (sample.creatives as number)) errors.add(`${at}.sample.${key}`, 'must be an integer <= creatives');
    }
  }
  validateStats(errors, `${at}.formatMix`, value.formatMix);
  validateStats(errors, `${at}.audienceSignals`, value.audienceSignals);

  if (!Array.isArray(value.topLaunchers) || value.topLaunchers.length > PULSE.topLaunchersMax) errors.add(`${at}.topLaunchers`, `must be an array of <= ${PULSE.topLaunchersMax}`);
  else {
    value.topLaunchers.forEach((l, i) => {
      const where = `${at}.topLaunchers[${i}]`;
      if (!isRecord(l)) return errors.add(where, 'must be an object');
      checkKeys(errors, where, l, ['advertiser', 'newCreatives', 'exampleUrl']);
      if (!isText(l.advertiser, 200)) errors.add(`${where}.advertiser`, 'must be a non-empty string');
      if (!isInt(l.newCreatives, 1, Number.MAX_SAFE_INTEGER)) errors.add(`${where}.newCreatives`, 'must be a positive integer');
      checkUrl(errors, `${where}.exampleUrl`, l.exampleUrl);
    });
  }
  if (!Array.isArray(value.longRunners) || value.longRunners.length > PULSE.longRunnersMax) errors.add(`${at}.longRunners`, `must be an array of <= ${PULSE.longRunnersMax}`);
  else {
    value.longRunners.forEach((r, i) => {
      const where = `${at}.longRunners[${i}]`;
      if (!isRecord(r)) return errors.add(where, 'must be an object');
      checkKeys(errors, where, r, ['advertiser', 'format', 'firstShown', 'url']);
      if (!isText(r.advertiser, 200)) errors.add(`${where}.advertiser`, 'must be a non-empty string');
      if (!isText(r.format, 20)) errors.add(`${where}.format`, 'must be a non-empty string');
      if (typeof r.firstShown !== 'string' || !isYmd(r.firstShown)) errors.add(`${where}.firstShown`, 'must be YYYY-MM-DD');
      checkUrl(errors, `${where}.url`, r.url);
    });
  }
  if (!Array.isArray(value.insights) || value.insights.length !== 3 || value.insights.some((s) => !isText(s, 300))) {
    errors.add(`${at}.insights`, 'must be exactly 3 non-empty sentences');
  }
}

const EDITION_FILE = /^editions\/(\d{4}-\d{2}-\d{2})\/(performance|ua|brand)\.json$/;
const FEED_FILE = /^feed\/(news|platform|expert|creative)\.json$/;

function validateLatest(errors: Errors, at: string, value: unknown, files: ReadonlySet<string>): void {
  if (!isRecord(value)) {
    errors.add(at, 'must be an object');
    return;
  }
  checkKeys(errors, at, value, ['version', 'generatedAt', 'editionDate', 'editions', 'feeds', 'pulse', 'sources']);
  if (value.version !== 1) errors.add(`${at}.version`, 'must be 1');
  if (!isIsoUtc(value.generatedAt)) errors.add(`${at}.generatedAt`, 'must be ISO 8601 UTC');
  if (value.editionDate !== null && !(typeof value.editionDate === 'string' && isYmd(value.editionDate))) errors.add(`${at}.editionDate`, 'must be YYYY-MM-DD or null');

  if (!isRecord(value.editions)) errors.add(`${at}.editions`, 'must be an object');
  else {
    checkKeys(errors, `${at}.editions`, value.editions, ROLES);
    for (const role of ROLES) {
      const path = value.editions[role];
      if (path === null) continue;
      const match = typeof path === 'string' ? EDITION_FILE.exec(path) : null;
      if (!match || match[2] !== role) errors.add(`${at}.editions.${role}`, 'must be null or editions/<date>/<role>.json');
      else if (!files.has(path as string)) errors.add(`${at}.editions.${role}`, `points to missing file ${path}`);
    }
    const dates = ROLES.map((role) => value.editions && (value.editions as Rec)[role]).filter((p): p is string => typeof p === 'string').map((p) => p.split('/')[1]);
    const newest = dates.sort().at(-1) ?? null;
    if (value.editionDate !== newest) errors.add(`${at}.editionDate`, 'must be the newest edition date');
  }

  if (!isRecord(value.feeds)) errors.add(`${at}.feeds`, 'must be an object');
  else {
    checkKeys(errors, `${at}.feeds`, value.feeds, SECTIONS);
    for (const section of SECTIONS) {
      const path = value.feeds[section];
      if (path !== `feed/${section}.json`) errors.add(`${at}.feeds.${section}`, `must be "feed/${section}.json"`);
      else if (!files.has(path)) errors.add(`${at}.feeds.${section}`, `points to missing file ${path}`);
    }
  }

  if (value.pulse !== null && value.pulse !== PULSE_PATH) errors.add(`${at}.pulse`, `must be null or "${PULSE_PATH}"`);
  if ((value.pulse === PULSE_PATH) !== files.has(PULSE_PATH)) errors.add(`${at}.pulse`, 'must be set exactly when pulse/latest.json is published');

  if (!Array.isArray(value.sources) || value.sources.length === 0) errors.add(`${at}.sources`, 'must be a non-empty array');
  else {
    value.sources.forEach((s, i) => {
      const where = `${at}.sources[${i}]`;
      if (!isRecord(s)) return errors.add(where, 'must be an object');
      checkKeys(errors, where, s, ['name', 'section', 'url']);
      if (!isText(s.name, 120)) errors.add(`${where}.name`, 'must be a non-empty string');
      if (!SECTIONS.includes(s.section as Section)) errors.add(`${where}.section`, 'unknown section');
      checkUrl(errors, `${where}.url`, s.url);
    });
  }
}

/** Belt and braces: any key ending in "url" anywhere in the output must hold an http(s) URL. */
function scanUrlKeys(errors: Errors, at: string, value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach((v, i) => scanUrlKeys(errors, `${at}[${i}]`, v));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, v] of Object.entries(value)) {
    if (/url$/i.test(key) && v !== undefined) checkUrl(errors, `${at}.${key}`, v);
    else scanUrlKeys(errors, `${at}.${key}`, v);
  }
}

/** Validates the full set of /v1 outputs. Returns human-readable errors (empty = valid). */
export function validateOutputs(outputs: Outputs): string[] {
  const errors = new Errors();
  const files = new Set(outputs.keys());
  if (!files.has(LATEST_PATH)) errors.add(LATEST_PATH, 'missing');
  for (const section of SECTIONS) if (!files.has(`feed/${section}.json`)) errors.add(`feed/${section}.json`, 'missing');

  for (const [path, value] of outputs) {
    let match: RegExpExecArray | null;
    if (path === LATEST_PATH) validateLatest(errors, path, value, files);
    else if (path === PULSE_PATH) validatePulse(errors, path, value);
    else if ((match = EDITION_FILE.exec(path))) validateEdition(errors, path, value, { date: match[1] as string, role: match[2] as Role });
    else if ((match = FEED_FILE.exec(path))) validateFeed(errors, path, value, match[1] as Section);
    else errors.add(path, 'unexpected output file');
    scanUrlKeys(errors, path, value);
  }
  return [...new Set(errors.list)];
}

/** Errors for a single item (used by tests and for diagnostics). */
export function itemErrors(item: unknown): string[] {
  const errors = new Errors();
  validateItem(errors, 'item', item);
  scanUrlKeys(errors, 'item', item);
  return [...new Set(errors.list)];
}
