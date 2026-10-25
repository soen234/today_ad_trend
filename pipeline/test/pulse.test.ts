import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  aggregateLines, createAggregate, currentGeneration, deltasReported, fallbackInsights, generateInsights, listShardObjects, mergeAggregates, pulseItemId,
  pulseSyntheticItem, pulseWindow, runPulse, selectShards, shouldRebuildPulse, summarizePulse, weekLabel,
} from '../src/pulse.ts';
import type { CreativePulse } from '../src/types.ts';
import { itemErrors } from '../src/validate.ts';
import { fakeLlm, fixture } from './helpers.ts';

const NOW = new Date('2026-10-25T21:00:00Z');
const WINDOW = pulseWindow(NOW);
const LINES = fixture('creative-stats.ndjson').split('\n');
const META = { shards: 6, totalShards: 1100, generatedAt: '2026-10-25T21:00:00Z' };
/** The fixture is tiny, so detailed expectations lower the production thresholds (300 / 5). */
const SMALL = { minNewForDelta: 1, minLauncherCreatives: 3 };

describe('pulseWindow', () => {
  it('ends two days before today and spans 7 days, with the prior week before it', () => {
    assert.deepEqual(WINDOW, {
      weekStart: '2026-10-17',
      weekEnd: '2026-10-23',
      priorStart: '2026-10-10',
      priorEnd: '2026-10-16',
      longRunFirstShownMax: '2026-07-25',
      longRunLastShownMin: '2026-10-20',
    });
  });
});

describe('aggregation (fixture NDJSON)', async () => {
  const agg = await aggregateLines(LINES, WINDOW);
  const draft = summarizePulse(agg, WINDOW, META, SMALL);

  it('counts valid creatives and invalid lines', () => {
    assert.equal(agg.creatives, 13);
    assert.equal(agg.invalid, 2);
    assert.deepEqual(draft.sample, { shards: 6, totalShards: 1100, creatives: 13, newThisWeek: 4, newPriorWeek: 3 });
  });

  it('uses the earliest first_shown across regions', () => {
    // CR701 shows 10-19 in DE but 10-15 in FR, so it belongs to the prior week.
    assert.equal(agg.priorWeek.formats.IMAGE, 1);
    assert.equal(agg.thisWeek.formats.IMAGE, 2);
  });

  it('computes format mix shares and point deltas vs the prior week', () => {
    assert.deepEqual(draft.formatMix, [
      { label: 'Image', share: 0.5, deltaPt: 16.7 },
      { label: 'Text', share: 0.25, deltaPt: -8.3 },
      { label: 'Video', share: 0.25, deltaPt: -8.3 },
    ]);
  });

  it('counts INCLUDED and INCLUDED_AND_EXCLUDED as using an audience approach', () => {
    assert.deepEqual(draft.audienceSignals, [
      { label: 'Demographics', share: 0.75, deltaPt: 41.7 },
      { label: 'Location', share: 0.75, deltaPt: 75 },
      { label: 'Contextual signals', share: 0.25, deltaPt: 25 },
      { label: 'Customer lists', share: 0, deltaPt: 0 },
      { label: 'Topics of interest', share: 0, deltaPt: 0 },
    ]);
  });

  it('lists advertisers with at least 3 new creatives, with a visual example', () => {
    assert.deepEqual(draft.topLaunchers, [
      { advertiser: 'Acme', newCreatives: 3, exampleUrl: 'https://adstransparency.google.com/advertiser/AR1/creative/CR102' },
    ]);
  });

  it('finds long runners (first shown <= weekEnd-90d, still shown >= weekEnd-3d), one per advertiser', () => {
    assert.deepEqual(draft.longRunners, [
      { advertiser: 'Beta', format: 'Video', firstShown: '2026-05-01', url: 'https://adstransparency.google.com/advertiser/AR2/creative/CR203' },
      // creative_page_url was "javascript:…", so the safe canonical page URL is rebuilt from the ids.
      { advertiser: 'Gamma', format: 'Image', firstShown: '2026-07-25', url: 'https://adstransparency.google.com/advertiser/AR3/creative/CR301' },
    ]);
  });

  it('gives the same result when shards are aggregated separately and merged', async () => {
    const half = Math.floor(LINES.length / 2);
    const a = await aggregateLines(LINES.slice(0, half), WINDOW);
    const b = await aggregateLines(LINES.slice(half), WINDOW);
    const merged = mergeAggregates(mergeAggregates(createAggregate(), a), b);
    assert.deepEqual(summarizePulse(merged, WINDOW, META, SMALL), draft);
  });

  it('writes 3 template insights that say the numbers come from a sample', () => {
    const insights = fallbackInsights(draft, SMALL.minNewForDelta);
    assert.equal(insights.length, 3);
    assert.match(insights[0] ?? '', /^In a sample of 4 ads first shown 2026-10-17 to 2026-10-23 \(6 of 1100 data shards\), image was the most common format at 50% \(\+16\.7 pts vs the prior week\)\.$/);
    assert.match(insights[1] ?? '', /sampled new ads/);
    assert.match(insights[2] ?? '', /^Acme launched the most new ads in the sample \(3\)/);
  });
});

describe('production thresholds', async () => {
  const agg = await aggregateLines(LINES, WINDOW);
  const draft = summarizePulse(agg, WINDOW, META);

  it('reports deltas only when both weeks have >= 300 new creatives in the sample', () => {
    assert.equal(deltasReported({ newThisWeek: 300, newPriorWeek: 300 }), true);
    assert.equal(deltasReported({ newThisWeek: 5000, newPriorWeek: 299 }), false);
    assert.ok([...draft.formatMix, ...draft.audienceSignals].every((s) => s.deltaPt === 0));
    assert.equal(draft.formatMix[0]?.share, 0.5, 'shares are still reported');
  });

  it('says so in the template insights instead of describing changes', () => {
    const insights = fallbackInsights(draft);
    assert.equal(insights.length, 3);
    assert.ok(!insights.join(' ').includes('vs the prior week'));
    assert.equal(insights[2], 'Week-over-week changes are not reported because the sample has fewer than 300 new ads in one of the two weeks (4 vs 3).');
  });

  it('requires at least 5 sample creatives for a top launcher', () => {
    assert.deepEqual(draft.topLaunchers, []);
  });
});

describe('insights via LLM', () => {
  const draftPromise = aggregateLines(LINES, WINDOW).then((agg) => summarizePulse(agg, WINDOW, META));

  it('accepts 3 valid sentences', async () => {
    const draft = await draftPromise;
    const sentences = ['Image ads made up an estimated half of new ads in the sample.', 'Demographic targeting was used by an estimated 75% of sampled new ads.', 'Acme launched the most new ads in the sample this week.'];
    const { llm, requests } = fakeLlm(() => ({ insights: sentences }));
    const result = await generateInsights(llm, draft);
    assert.deepEqual(result, { insights: sentences, fromLlm: true });
    assert.equal(requests.length, 1);
  });

  it('falls back to the template when any insight carries a link or markup', async () => {
    const draft = await draftPromise;
    for (const bad of ['See https://evil.example for the full data set.', 'Video led new ads; <a href="x">details</a> inside.', 'Video led new ads, see [the report](https://evil.example).']) {
      const { llm } = fakeLlm(() => ({ insights: ['Image ads made up an estimated half of new ads in the sample.', bad, 'Acme launched the most new ads in the sample this week.'] }));
      const result = await generateInsights(llm, draft);
      assert.equal(result.fromLlm, false, bad);
      assert.deepEqual(result.insights, fallbackInsights(draft));
    }
  });

  it('falls back to the template on a bad response', async () => {
    const draft = await draftPromise;
    const { llm } = fakeLlm(() => ({ insights: ['too short'] }));
    const result = await generateInsights(llm, draft);
    assert.equal(result.fromLlm, false);
    assert.deepEqual(result.insights, fallbackInsights(draft));
  });
});

describe('schedule and sampling', () => {
  const pulse = { generatedAt: '2026-10-19T21:00:00Z' } as CreativePulse;

  it('rebuilds on Monday 21:00 UTC, when older than 7 days, when missing, or when forced', () => {
    assert.equal(shouldRebuildPulse(new Date('2026-10-26T21:10:00Z'), pulse, false).build, true); // Monday
    assert.equal(shouldRebuildPulse(new Date('2026-10-25T21:00:00Z'), pulse, false).build, false);
    assert.equal(shouldRebuildPulse(new Date('2026-10-27T03:00:00Z'), pulse, false).build, true); // > 7 days
    assert.equal(shouldRebuildPulse(new Date('2026-10-20T03:00:00Z'), null, false).build, true);
    assert.equal(shouldRebuildPulse(new Date('2026-10-20T03:00:00Z'), pulse, true).build, true);
  });

  it('samples shards deterministically per week', () => {
    const names = Array.from({ length: 50 }, (_, i) => `api-data/creative-stats/data-${String(i).padStart(12, '0')}.json`);
    const a = selectShards(names, '2026-10-17', 6);
    assert.equal(a.length, 6);
    assert.deepEqual(a, selectShards([...names].reverse(), '2026-10-17', 6));
    assert.notDeepEqual(a, selectShards(names, '2026-10-24', 6));
    assert.deepEqual(a, [...a].sort());
  });

  it('samples only the current export generation, not stale shards left in the bucket', () => {
    const objects = [
      { name: 'a.json', updated: '2026-10-25T09:10:00Z' },
      { name: 'b.json', updated: '2026-10-25T09:40:00Z' },
      { name: 'c.json', updated: '2026-10-24T09:30:00Z' }, // previous daily export, still recent
      { name: 'd.json', updated: '2025-10-15T09:00:00Z' }, // a year old
      { name: 'e.json', updated: '' },
    ];
    assert.deepEqual(currentGeneration(objects), ['a.json', 'b.json', 'c.json']);
  });

  it('formats week labels', () => {
    assert.equal(weekLabel('2026-10-17', '2026-10-23'), 'Oct 17–23, 2026');
    assert.equal(weekLabel('2026-09-28', '2026-10-04'), 'Sep 28–Oct 4, 2026');
  });
});

describe('synthetic creative item', () => {
  it('links to the pulse page, draws its summary from the insights and passes the contract', async () => {
    const agg = await aggregateLines(LINES, WINDOW);
    const draft = summarizePulse(agg, WINDOW, META);
    const pulse: CreativePulse = { ...draft, insights: fallbackInsights(draft) };
    const item = pulseSyntheticItem(pulse, false);
    assert.equal(item.url, 'https://todayadtrend.com/pulse?week=2026-10-17');
    assert.equal(item.id, pulseItemId(pulse));
    assert.equal(item.section, 'creative');
    assert.equal(item.source, 'TAT Creative Pulse');
    assert.equal(item.publishedAt, pulse.generatedAt);
    assert.ok(item.summary.length <= 280);
    assert.ok(item.summary.startsWith(pulse.insights[0] ?? '-'));
    const { attempts, ingestedAt, snippet, ...publicItem } = item;
    void attempts; void ingestedAt; void snippet;
    assert.deepEqual(itemErrors(publicItem), []);
  });
});

describe('GCS listing bounds', () => {
  it('rejects an oversized listing response', async () => {
    const fetchImpl = async (): Promise<Response> => new Response('{}', { status: 200, headers: { 'content-length': String(6 * 1024 * 1024) } });
    await assert.rejects(listShardObjects(fetchImpl), /exceeds/);
  });
});

describe('runPulse (mocked GCS)', () => {
  it('lists with pagination, skips stale shards, streams the sample and survives a failing shard', async () => {
    const shard = (i: number): string => `api-data/creative-stats/data-${String(i).padStart(12, '0')}.json`;
    // 8 current shards plus 8 stale ones from a year-old export under the same naming scheme.
    const objects = [
      ...Array.from({ length: 8 }, (_, i) => ({ name: shard(i), updated: '2026-10-25T09:20:00.000Z' })),
      ...Array.from({ length: 8 }, (_, i) => ({ name: shard(100 + i), updated: '2025-10-15T09:20:00.000Z' })),
    ];
    const requested: string[] = [];
    let failed = '';
    const fetchImpl = async (url: string): Promise<Response> => {
      requested.push(url);
      if (url.startsWith('https://storage.googleapis.com/storage/v1/b/ads-transparency-center/o?')) {
        assert.ok(url.includes('fields=items(name,updated),nextPageToken'));
        const page2 = url.includes('pageToken=');
        const body = page2 ? { items: objects.slice(10) } : { items: objects.slice(0, 10), nextPageToken: 'tok/1' };
        return Response.json(body);
      }
      assert.ok(!/data-0+10\d\.json$/.test(url), `stale shard requested: ${url}`);
      if (!failed) {
        failed = url;
        return new Response('nope', { status: 503 });
      }
      return new Response(fixture('creative-stats.ndjson'), { status: 200 });
    };
    const { llm } = fakeLlm(() => ({}), { disabled: true });
    const { pulse, item } = await runPulse({ now: NOW, llm, fetch: fetchImpl, shards: 6 });
    assert.ok(requested[1]?.includes('pageToken=tok%2F1'));
    assert.equal(requested.filter((u) => u.startsWith('https://storage.googleapis.com/ads-transparency-center/')).length, 6);
    assert.deepEqual(pulse.sample, { shards: 5, totalShards: 8, creatives: 65, newThisWeek: 20, newPriorWeek: 15 });
    assert.deepEqual(pulse.topLaunchers, [
      { advertiser: 'Acme', newCreatives: 15, exampleUrl: 'https://adstransparency.google.com/advertiser/AR1/creative/CR102' },
      { advertiser: 'Beta', newCreatives: 5, exampleUrl: 'https://adstransparency.google.com/advertiser/AR2/creative/CR201' }, // exactly the minimum of 5
    ]);
    assert.equal(pulse.insights.length, 3);
    assert.equal(item.enriched, false);
  });
});
