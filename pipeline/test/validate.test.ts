import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { SOURCES } from '../src/config.ts';
import { buildOutputs, toPublicItem, writeOutputs } from '../src/publish.ts';
import type { Outputs } from '../src/publish.ts';
import { aggregateLines, fallbackInsights, pulseSyntheticItem, pulseWindow, summarizePulse } from '../src/pulse.ts';
import { loadState, pruneState, saveState } from '../src/state.ts';
import type { CreativePulse, Edition, Item, Latest, PipelineState, Role, SectionFeed } from '../src/types.ts';
import { itemErrors, validateOutputs } from '../src/validate.ts';
import { fixture, makeItem } from './helpers.ts';

const NOW = new Date('2026-10-25T21:00:00Z');
const ROLES: Role[] = ['performance', 'ua', 'brand'];

function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3_600_000).toISOString().replace(/\.000Z$/, 'Z');
}

async function samplePulse(): Promise<CreativePulse> {
  const window = pulseWindow(NOW);
  const agg = await aggregateLines(fixture('creative-stats.ndjson').split('\n'), window);
  // Lower thresholds so the tiny fixture yields deltas and a top launcher to validate.
  const draft = summarizePulse(agg, window, { shards: 6, totalShards: 1100, generatedAt: '2026-10-25T21:00:00Z' }, { minNewForDelta: 1, minLauncherCreatives: 3 });
  return { ...draft, insights: fallbackInsights(draft) };
}

function edition(role: Role, date: string, items: Item[]): Edition {
  return { version: 1, date, role, generatedAt: `${date}T21:00:00Z`, headline: `Headline for ${role}`, items: items.map(toPublicItem) };
}

async function sampleState(): Promise<PipelineState> {
  const pulse = await samplePulse();
  const items = [
    makeItem({ section: 'news', publishedAt: hoursAgo(1), imageUrl: 'https://cdn.example.com/a.jpg', snippet: 'internal' }),
    makeItem({ section: 'news', publishedAt: hoursAgo(5) }),
    makeItem({ section: 'platform', publishedAt: hoursAgo(2), platforms: ['meta'] }),
    makeItem({ section: 'expert', publishedAt: hoursAgo(3), tags: ['growth'] }),
    makeItem({ section: 'expert', publishedAt: hoursAgo(4) }),
    makeItem({ section: 'news', publishedAt: hoursAgo(24 * 20) }), // outside the 14-day feed window
    pulseSyntheticItem(pulse, false),
  ];
  const five = items.slice(0, 5);
  const editions = [
    ...ROLES.map((role) => edition(role, '2026-10-25', five)),
    edition('performance', '2026-10-26', five),
    edition('ua', '2026-10-26', five),
  ];
  return { items, editions, pulse };
}

// --- path helpers: mutate parsed JSON without loosening types -------------------------------

function getPath(root: unknown, path: string): unknown {
  if (!path) return root;
  return path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], root);
}

function setPath(root: unknown, path: string, value: unknown): void {
  const keys = path.split('.');
  const parent = getPath(root, keys.slice(0, -1).join('.')) as Record<string, unknown>;
  parent[keys.at(-1) as string] = value;
}

function list(root: unknown, path: string): unknown[] {
  return [...(getPath(root, path) as unknown[])];
}

type Change = (value: unknown) => void;

function set(path: string, value: unknown): Change {
  return (v) => setPath(v, path, value);
}

function mutate(outputs: Outputs, file: string, change: Change): string[] {
  const copy = new Map([...outputs].map(([path, value]) => [path, structuredClone(value)]));
  change(copy.get(file));
  return validateOutputs(copy);
}

describe('validateOutputs', async () => {
  const state = await sampleState();
  const outputs = buildOutputs(state, NOW);

  it('accepts what buildOutputs produces', () => {
    assert.deepEqual(validateOutputs(outputs), []);
    assert.deepEqual([...outputs.keys()].sort(), [
      'editions/2026-10-25/brand.json', 'editions/2026-10-25/performance.json', 'editions/2026-10-25/ua.json',
      'editions/2026-10-26/performance.json', 'editions/2026-10-26/ua.json',
      'feed/creative.json', 'feed/expert.json', 'feed/news.json', 'feed/platform.json',
      'latest.json', 'pulse/latest.json',
    ]);
  });

  describe('rejects non-http(s) URLs anywhere', () => {
    const cases: [string, string, Change][] = [
      ['javascript: item url in a feed', 'feed/news.json', set('items.0.url', 'javascript:alert(1)')],
      ['data: item url in an edition', 'editions/2026-10-26/ua.json', set('items.2.url', 'data:text/html,<script>alert(1)</script>')],
      ['relative item url', 'feed/expert.json', set('items.0.url', '/2026/10/post')],
      ['protocol-relative item url', 'feed/expert.json', set('items.0.url', '//evil.example.com/x')],
      ['app-scheme item url', 'feed/platform.json', set('items.0.url', 'fb://page/123')],
      ['javascript: imageUrl', 'feed/news.json', set('items.0.imageUrl', 'javascript:alert(1)')],
      ['data: imageUrl', 'feed/news.json', set('items.0.imageUrl', 'data:image/svg+xml,<svg onload=alert(1)>')],
      ['data: exampleUrl', 'pulse/latest.json', set('topLaunchers.0.exampleUrl', 'data:text/html,hi')],
      ['relative long-runner url', 'pulse/latest.json', set('longRunners.0.url', 'advertiser/AR2/creative/CR203')],
      ['javascript: source url', 'latest.json', set('sources.0.url', 'javascript:alert(1)')],
      ['relative source url', 'latest.json', set('sources.1.url', '/feed')],
    ];
    for (const [name, file, change] of cases) {
      it(name, () => {
        const errors = mutate(outputs, file, change);
        assert.ok(errors.some((e) => e.includes('must be an absolute http(s) URL')), errors.join('\n'));
      });
    }

    it('catches a URL hidden under an unexpected key', () => {
      const errors = mutate(outputs, 'feed/news.json', set('items.0.extra', { logoUrl: 'javascript:alert(1)' }));
      assert.ok(errors.some((e) => e.includes('unexpected key "extra"')));
      assert.ok(errors.some((e) => e.includes('logoUrl: must be an absolute http(s) URL')));
    });
  });

  describe('rejects contract violations', () => {
    const cases: [string, string, Change, RegExp][] = [
      ['internal fields leaking', 'feed/news.json', set('items.0.snippet', 'x'), /unexpected key "snippet"/],
      ['edition with 4 items', 'editions/2026-10-25/brand.json', (v) => setPath(v, 'items', list(v, 'items').slice(0, 4)), /must have 5-7 items/],
      ['edition with 8 items', 'editions/2026-10-25/brand.json', (v) => setPath(v, 'items', [...list(v, 'items'), ...list(v, 'items').slice(0, 3)]), /must have 5-7 items/],
      ['duplicate ids', 'editions/2026-10-25/brand.json', (v) => setPath(v, 'items.1', getPath(v, 'items.0')), /ids must be unique/],
      ['soWhat with relevance 0', 'feed/news.json', set('items.0.roles.ua', { relevance: 0, soWhat: 'Do it' }), /must be empty when relevance is 0/],
      ['relevance out of range', 'feed/news.json', set('items.0.roles.ua.relevance', 4), /integer 0-3/],
      ['importance out of range', 'feed/news.json', set('items.0.importance', 0), /integer 1-5/],
      ['too many tags', 'feed/news.json', set('items.0.tags', ['a', 'b', 'c', 'd', 'e']), /tags/],
      ['uppercase tag', 'feed/news.json', set('items.0.tags', ['CTV']), /tags/],
      ['unknown platform', 'feed/news.json', set('items.0.platforms', ['myspace']), /platforms/],
      ['summary over 280', 'feed/news.json', set('items.0.summary', 'x'.repeat(281)), /summary/],
      ['non-UTC date', 'feed/news.json', set('items.0.publishedAt', '2026-10-25T12:00:00+02:00'), /ISO 8601 UTC/],
      ['feed not newest first', 'feed/news.json', (v) => setPath(v, 'items', list(v, 'items').reverse()), /newest first/],
      ['wrong section in feed', 'feed/news.json', set('items.0.section', 'expert'), /must be "news"/],
      ['pulse with 2 insights', 'pulse/latest.json', (v) => setPath(v, 'insights', list(v, 'insights').slice(0, 2)), /exactly 3/],
      ['pulse share above 1', 'pulse/latest.json', set('formatMix.0.share', 1.5), /0\.\.1/],
      ['pulse sample bigger than total', 'pulse/latest.json', (v) => setPath(v, 'sample.newThisWeek', (getPath(v, 'sample.creatives') as number) + 1), /<= creatives/],
      ['latest pointing to a missing edition', 'latest.json', set('editions.brand', 'editions/2026-10-27/brand.json'), /missing file/],
      ['latest with a wrong editionDate', 'latest.json', set('editionDate', '2026-10-25'), /newest edition date/],
    ];
    for (const [name, file, change, pattern] of cases) {
      it(name, () => {
        const errors = mutate(outputs, file, change);
        assert.ok(errors.some((e) => pattern.test(e)), errors.join('\n') || 'no errors');
      });
    }

    it('rejects unexpected files and missing feeds', () => {
      const copy = new Map(outputs);
      copy.set('debug.json', {});
      copy.delete('feed/creative.json');
      const errors = validateOutputs(copy);
      assert.ok(errors.some((e) => e.startsWith('debug.json: unexpected output file')));
      assert.ok(errors.some((e) => e.startsWith('feed/creative.json: missing')));
    });
  });

  it('itemErrors flags javascript:, data: and relative urls on a single item', () => {
    const good = toPublicItem(makeItem());
    assert.deepEqual(itemErrors(good), []);
    for (const url of ['javascript:alert(1)', 'data:text/html,x', 'relative/path']) {
      assert.ok(itemErrors({ ...good, url }).some((e) => e.includes('item.url')), url);
      assert.ok(itemErrors({ ...good, imageUrl: url }).some((e) => e.includes('item.imageUrl')), url);
    }
  });
});

describe('buildOutputs', async () => {
  const state = await sampleState();
  const outputs = buildOutputs(state, NOW);
  const latest = outputs.get('latest.json') as Latest;

  it('points latest.json to the newest edition per role', () => {
    assert.equal(latest.version, 1);
    assert.equal(latest.generatedAt, '2026-10-25T21:00:00Z');
    assert.equal(latest.editionDate, '2026-10-26');
    assert.deepEqual(latest.editions, {
      performance: 'editions/2026-10-26/performance.json',
      ua: 'editions/2026-10-26/ua.json',
      brand: 'editions/2026-10-25/brand.json',
    });
    assert.deepEqual(latest.feeds, { news: 'feed/news.json', platform: 'feed/platform.json', expert: 'feed/expert.json', creative: 'feed/creative.json' });
    assert.equal(latest.pulse, 'pulse/latest.json');
  });

  it('lists every configured source plus the Creative Pulse data source', () => {
    assert.equal(latest.sources.length, SOURCES.length + 1);
    assert.deepEqual(latest.sources[0], { name: 'AdExchanger', section: 'news', url: 'https://www.adexchanger.com/' });
    assert.deepEqual(latest.sources.at(-1), { name: 'Google Ads Transparency Center', section: 'creative', url: 'https://adstransparency.google.com/' });
  });

  it('feeds hold the last 14 days, newest first, without internal fields', () => {
    const news = outputs.get('feed/news.json') as SectionFeed;
    assert.equal(news.items.length, 2);
    assert.ok((news.items[0]?.publishedAt ?? '') > (news.items[1]?.publishedAt ?? ''));
    assert.equal(news.items[0]?.imageUrl, 'https://cdn.example.com/a.jpg');
    for (const item of news.items) {
      assert.ok(!('snippet' in item) && !('attempts' in item) && !('ingestedAt' in item));
    }
    assert.equal((outputs.get('feed/creative.json') as SectionFeed).items.length, 1);
  });

  it('caps feeds at 200 items and handles an empty state', () => {
    const many = Array.from({ length: 230 }, (_, i) => makeItem({ section: 'expert', publishedAt: hoursAgo(i / 10) }));
    const big = buildOutputs({ items: many, editions: [], pulse: null }, NOW);
    assert.equal((big.get('feed/expert.json') as SectionFeed).items.length, 200);
    const bigLatest = big.get('latest.json') as Latest;
    assert.equal(bigLatest.pulse, null);
    assert.equal(bigLatest.editionDate, null);
    assert.deepEqual(bigLatest.editions, { performance: null, ua: null, brand: null });
    assert.deepEqual(validateOutputs(big), []);
  });

  it('writes compact JSON under v1/ and removes stale files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'tat-out-'));
    await mkdir(join(dir, 'v1', 'editions', '1999-01-01'), { recursive: true });
    await writeFile(join(dir, 'v1', 'editions', '1999-01-01', 'brand.json'), '{}');
    await writeFile(join(dir, 'index.html'), 'keep me');
    await writeOutputs(dir, outputs);
    const text = await readFile(join(dir, 'v1', 'latest.json'), 'utf8');
    assert.ok(!text.includes('\n'));
    assert.deepEqual(JSON.parse(text), latest);
    assert.deepEqual((await readdir(join(dir, 'v1', 'editions'))).sort(), ['2026-10-25', '2026-10-26']);
    assert.equal(await readFile(join(dir, 'index.html'), 'utf8'), 'keep me');
  });
});

describe('state', () => {
  it('round-trips through save/load and starts empty when missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'tat-state-'));
    assert.deepEqual(await loadState(join(dir, 'nope')), { items: [], editions: [], pulse: null });
    const state = await sampleState();
    await saveState(dir, state);
    const loaded = await loadState(dir);
    assert.equal(loaded.items.length, state.items.length);
    assert.deepEqual(new Set(loaded.items.map((i) => i.id)), new Set(state.items.map((i) => i.id)));
    assert.deepEqual(loaded.editions, state.editions);
    assert.deepEqual(loaded.pulse, state.pulse);
    const raw = await readFile(join(dir, 'items.json'), 'utf8');
    assert.equal(raw.split('\n').length, state.items.length + 3, 'one item per line');
  });

  it('fails loudly on corrupt state instead of resetting it', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'tat-state-'));
    await writeFile(join(dir, 'items.json'), '[{"id":');
    await assert.rejects(loadState(dir), /not valid JSON/);
  });

  it('prunes items older than 30 days and keeps the newest 30 edition dates', () => {
    const recent = makeItem({ publishedAt: hoursAgo(24 * 29) });
    const old = makeItem({ publishedAt: hoursAgo(24 * 31) });
    const editions = Array.from({ length: 35 }, (_, i) => {
      const date = new Date(Date.UTC(2026, 9, 26 - i)).toISOString().slice(0, 10);
      return edition('brand', date, []);
    });
    const pruned = pruneState({ items: [recent, old], editions, pulse: null }, NOW);
    assert.deepEqual(pruned.items, [recent]);
    assert.equal(pruned.editions.length, 30);
    assert.equal(pruned.editions.at(-1)?.date, '2026-09-27');
  });
});
