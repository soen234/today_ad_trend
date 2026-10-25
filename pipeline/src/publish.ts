import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { FEED, PULSE_DATA_SOURCE, ROLES, SECTIONS, SOURCES } from './config.ts';
import { capPerSourceDay } from './ingest.ts';
import type { Edition, Item, Latest, PipelineState, Role, Section, SectionFeed } from './types.ts';
import { DAY_MS, toIso } from './util.ts';

/** Projects an item (possibly a StoredItem with internal fields) onto exactly the public contract. */
export function toPublicItem(item: Item): Item {
  const out: Item = {
    id: item.id,
    section: item.section,
    title: item.title,
    url: item.url,
    source: item.source,
    publishedAt: item.publishedAt,
    summary: item.summary,
    platforms: [...item.platforms],
    tags: [...item.tags],
    importance: item.importance,
    roles: {
      performance: { relevance: item.roles.performance.relevance, soWhat: item.roles.performance.soWhat },
      ua: { relevance: item.roles.ua.relevance, soWhat: item.roles.ua.soWhat },
      brand: { relevance: item.roles.brand.relevance, soWhat: item.roles.brand.soWhat },
    },
    enriched: item.enriched,
  };
  if (item.imageUrl) out.imageUrl = item.imageUrl;
  return out;
}

export function editionPath(date: string, role: Role): string {
  return `editions/${date}/${role}.json`;
}

export function feedPath(section: Section): string {
  return `feed/${section}.json`;
}

export const PULSE_PATH = 'pulse/latest.json';
export const LATEST_PATH = 'latest.json';

/** Output files keyed by path relative to the `v1/` directory. */
export type Outputs = Map<string, unknown>;

export function newestFirst(a: Item, b: Item): number {
  return b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id);
}

/** Over the per-day cap, keep the highest importance once enriched; unenriched items rank by recency. */
function feedRank(a: Item, b: Item): number {
  const ia = a.enriched ? a.importance : 0;
  const ib = b.enriched ? b.importance : 0;
  return ib - ia || newestFirst(a, b);
}

/**
 * Keeps the (newest-first) order but never emits more than `maxRun` consecutive items from one
 * source while another source still has items; the next item from a different source is pulled up.
 */
export function interleaveSources<T extends { source: string }>(sorted: readonly T[], maxRun: number): T[] {
  const remaining = [...sorted];
  const out: T[] = [];
  while (remaining.length > 0) {
    const tail = out.slice(-maxRun);
    const runSource = tail.length === maxRun && tail.every((item) => item.source === tail[0]?.source) ? tail[0]?.source : undefined;
    let index = runSource === undefined ? 0 : remaining.findIndex((item) => item.source !== runSource);
    if (index < 0) index = 0; // only that source is left
    out.push(...remaining.splice(index, 1));
  }
  return out;
}

// 피드: 최근 14일, 출처별 하루 12개 제한, 시간순이되 같은 출처가 3개 넘게 연속되지 않게 섞은 뒤 최대 200개.
export function buildFeed(items: readonly Item[], section: Section, now: Date): SectionFeed {
  const minTime = now.getTime() - FEED.days * DAY_MS;
  const recent = items.filter((item) => item.section === section && Date.parse(item.publishedAt) >= minTime);
  const capped = capPerSourceDay(recent, FEED.maxPerSourcePerDay, feedRank);
  const selected = interleaveSources([...capped].sort(newestFirst), FEED.maxConsecutivePerSource)
    .slice(0, FEED.maxItems)
    .map(toPublicItem);
  return { version: 1, generatedAt: toIso(now), items: selected };
}

/** Builds every /v1 file from state. Pure: nothing is written here. */
export function buildOutputs(state: PipelineState, now: Date): Outputs {
  const outputs: Outputs = new Map();
  const generatedAt = toIso(now);

  const editions = [...state.editions].sort((a, b) => b.date.localeCompare(a.date) || a.role.localeCompare(b.role));
  for (const edition of editions) {
    const published: Edition = { ...edition, items: edition.items.map(toPublicItem) };
    outputs.set(editionPath(edition.date, edition.role), published);
  }

  const feeds = {} as Record<Section, string>;
  for (const section of SECTIONS) {
    feeds[section] = feedPath(section);
    outputs.set(feeds[section], buildFeed(state.items, section, now));
  }

  if (state.pulse) outputs.set(PULSE_PATH, state.pulse);

  const latestEditions = {} as Record<Role, string | null>;
  for (const role of ROLES) {
    const newest = editions.find((edition) => edition.role === role);
    latestEditions[role] = newest ? editionPath(newest.date, role) : null;
  }

  const latest: Latest = {
    version: 1,
    generatedAt,
    editionDate: editions[0]?.date ?? null,
    editions: latestEditions,
    feeds,
    pulse: state.pulse ? PULSE_PATH : null,
    sources: [
      ...SOURCES.map((source) => ({ name: source.name, section: source.section, url: source.homeUrl })),
      { name: PULSE_DATA_SOURCE.name, section: PULSE_DATA_SOURCE.section, url: PULSE_DATA_SOURCE.url },
    ],
  };
  outputs.set(LATEST_PATH, latest);
  return outputs;
}

/** Replaces `<outDir>/v1` with the given outputs (compact JSON). */
export async function writeOutputs(outDir: string, outputs: Outputs): Promise<void> {
  const root = join(outDir, 'v1');
  await rm(root, { recursive: true, force: true });
  for (const [path, value] of outputs) {
    const file = join(root, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(value));
  }
}
