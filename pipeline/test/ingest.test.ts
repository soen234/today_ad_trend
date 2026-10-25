import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SourceConfig } from '../src/config.ts';
import {
  canonicalizeUrl, capPerSourceDay, cleanSnippet, dedupeItems, entriesToItems, ingestAll, isGlossaryEntry, isPuzzleTitle, itemId, mergeNewItems,
  normalizeTitle, parseFeed,
} from '../src/ingest.ts';
import {
  containsLinkOrMarkup, parseFeedDate, parseHttpUrl, sha1Hex, stripControlChars, stripHtml, stripLinksAndMarkup, truncateToSentence,
} from '../src/util.ts';
import { fixture, makeItem } from './helpers.ts';

const NOW = new Date('2026-10-25T21:00:00Z');
const NEWS: SourceConfig = { name: 'Fixture News', section: 'news', feedUrl: 'https://news.example.com/feed/', homeUrl: 'https://news.example.com/' };
const PLATFORM: SourceConfig = { name: 'Fixture Platform', section: 'platform', feedUrl: 'https://platform.example.com/blog/feed/', homeUrl: 'https://platform.example.com/blog/', platform: 'meta' };

describe('parseFeed: RSS 2.0', () => {
  const entries = parseFeed(fixture('rss.xml'));

  it('reads every item', () => {
    assert.equal(entries.length, 9);
  });

  it('decodes CDATA and entities in titles', () => {
    assert.equal(entries[0]?.title, 'Meta & Google expand AI ad tools');
    assert.equal(entries[1]?.title, 'Apple’s new AdAttributionKit rules for app marketers');
  });

  it('strips HTML from snippets and drops WordPress trailers', () => {
    assert.equal(entries[0]?.snippet, 'Both platforms added new creative tools for advertisers’ campaigns.');
  });

  it('falls back to content:encoded and drops figure captions', () => {
    assert.equal(entries[1]?.snippet, 'Apple changed postback windows for AdAttributionKit.');
  });

  it('takes images from media:content and image enclosures only', () => {
    assert.equal(entries[0]?.imageUrl, 'https://cdn.example.com/img/ai-tools.jpg');
    assert.equal(entries[1]?.imageUrl, 'https://cdn.example.com/img/aak.png');
    assert.equal(entries[3]?.imageUrl, undefined, 'audio enclosure is not an image');
  });

  it('uses a permalink guid when there is no <link>', () => {
    assert.equal(entries[3]?.link, 'https://news.example.com/2026/10/guid-only');
  });

  it('parses RFC 822 dates with zone names and date-only strings as UTC', () => {
    assert.equal(entries[0]?.publishedAt?.toISOString(), '2026-10-24T14:30:00.000Z');
    assert.equal(entries[1]?.publishedAt?.toISOString(), '2026-10-23T16:00:00.000Z');
    assert.equal(entries[2]?.publishedAt?.toISOString(), '2026-10-22T00:00:00.000Z');
    assert.equal(entries[8]?.publishedAt, null);
  });
});

describe('parseFeed: Atom', () => {
  const entries = parseFeed(fixture('atom.xml'));

  it('reads every entry and prefers the alternate html link', () => {
    assert.equal(entries.length, 3);
    assert.equal(entries[0]?.link, 'https://platform.example.com/blog/post/2026/10/audience-per-creative/');
    assert.equal(entries[1]?.link, 'https://platform.example.com/blog/post/2026/10/api-sunset/');
  });

  it('prefers published over updated, and uses updated when published is missing', () => {
    assert.equal(entries[0]?.publishedAt?.toISOString(), '2026-10-21T17:04:53.294Z');
    assert.equal(entries[1]?.publishedAt?.toISOString(), '2026-10-24T12:00:00.000Z');
  });

  it('decodes html titles and content, and reads media:thumbnail', () => {
    assert.equal(entries[1]?.title, 'API <v22> sunset & migration');
    assert.equal(entries[1]?.snippet, 'Version 21 of the Marketing API sunsets in January.');
    assert.equal(entries[0]?.snippet, 'Advertisers can now pick an audience for every creative in an ad set.');
    assert.equal(entries[0]?.imageUrl, 'https://platform.example.com/img/thumb.jpg');
  });

  it('rejects documents that are neither RSS nor Atom', () => {
    assert.throws(() => parseFeed('<html><body>hi</body></html>'), /not an RSS or Atom document/);
  });
});

describe('URL safety (absolute http/https only)', () => {
  it('parseHttpUrl rejects javascript:, data:, relative and other schemes', () => {
    for (const bad of [
      'javascript:alert(1)', 'JavaScript:alert(1)', ' javascript:alert(1)', 'data:text/html,<script>alert(1)</script>',
      'data:image/png;base64,AAAA', '/relative/path', 'relative/path', '//cdn.example.com/x.jpg', 'mailto:a@b.com',
      'fb://profile/1', 'intent://scan/#Intent;scheme=zxing;end', 'file:///etc/passwd', 'ftp://example.com/x', '', 'http://',
    ]) {
      assert.equal(parseHttpUrl(bad), null, bad);
    }
    assert.equal(parseHttpUrl('https://example.com/a')?.href, 'https://example.com/a');
    assert.equal(parseHttpUrl('http://example.com/a')?.href, 'http://example.com/a');
  });

  it('drops feed items whose link is javascript:, data: or relative', () => {
    const { items, stats } = entriesToItems(parseFeed(fixture('rss.xml')), NEWS, NOW);
    assert.equal(stats.noLink, 3);
    for (const item of items) assert.match(item.url, /^https:\/\/news\.example\.com\//);
    assert.ok(!items.some((item) => /Script link|Data link|Relative link/.test(item.title)));
  });

  it('drops a data: link in Atom', () => {
    const { items, stats } = entriesToItems(parseFeed(fixture('atom.xml')), PLATFORM, NOW);
    assert.equal(stats.noLink, 1);
    assert.equal(items.length, 2);
  });

  it('keeps the item but drops an unsafe imageUrl', () => {
    const { items } = entriesToItems(parseFeed(fixture('rss.xml')), NEWS, NOW);
    const awards = items.find((item) => item.title === 'Partner awards announced');
    assert.ok(awards, 'item kept');
    assert.equal(awards.imageUrl, undefined);
    assert.equal('imageUrl' in awards, false);
  });
});

describe('entriesToItems', () => {
  const { items, stats } = entriesToItems(parseFeed(fixture('rss.xml')), NEWS, NOW);

  it('keeps only dated items from the last 7 days', () => {
    assert.equal(stats.old, 1);
    assert.equal(stats.noDate, 1);
    assert.deepEqual(items.map((item) => item.title), [
      'Meta & Google expand AI ad tools',
      'Apple’s new AdAttributionKit rules for app marketers',
      'Partner awards announced',
      'Guid-only permalink post',
    ]);
  });

  it('canonicalizes urls and derives ids from them', () => {
    const first = items[0];
    assert.ok(first);
    assert.equal(first.url, 'https://news.example.com/2026/10/ai-tools/?ref=home');
    assert.equal(first.id, sha1Hex(first.url).slice(0, 12));
    assert.equal(items[1]?.url, 'https://news.example.com/2026/10/adattributionkit');
  });

  it('builds the fallback enrichment', () => {
    const first = items[0];
    assert.ok(first);
    assert.equal(first.section, 'news');
    assert.equal(first.source, 'Fixture News');
    assert.equal(first.enriched, false);
    assert.equal(first.importance, 2);
    assert.deepEqual(first.tags, []);
    // Keyword heuristic: only "creative" matches (brand); soWhat stays empty in the fallback.
    assert.deepEqual(first.roles, { performance: { relevance: 0, soWhat: '' }, ua: { relevance: 0, soWhat: '' }, brand: { relevance: 1, soWhat: '' } });
    assert.equal(first.summary, first.snippet);
    assert.deepEqual(first.platforms, ['meta', 'google']);
    const second = items[1];
    assert.deepEqual(second?.platforms, ['apple']);
    assert.equal(second?.importance, 3, '"new" in the title');
    assert.deepEqual(second?.roles.ua, { relevance: 2, soWhat: '' }, 'adattributionkit + app');
    assert.equal(first.publishedAt, '2026-10-24T14:30:00Z');
    assert.equal(first.attempts, 0);
  });

  it('adds the source platform hint and caps the fallback summary at 280 chars', () => {
    const long = 'word '.repeat(200);
    const { items: platformItems } = entriesToItems(
      [{ title: 'Something unrelated', link: 'https://platform.example.com/x', publishedAt: new Date('2026-10-25T10:00:00Z'), snippet: long }],
      PLATFORM,
      NOW,
    );
    assert.deepEqual(platformItems[0]?.platforms, ['meta']);
    assert.ok((platformItems[0]?.summary.length ?? 0) <= 280);
  });

  it('skips off-topic TV ratings and box office items', () => {
    const at = new Date('2026-10-25T10:00:00Z');
    const entries = [
      { title: 'Cable News Ratings: Week of Oct. 19', link: 'https://news.example.com/r1', publishedAt: at, snippet: '' },
      { title: 'Weekend box office: horror sequel tops charts', link: 'https://news.example.com/r2', publishedAt: at, snippet: '' },
      { title: 'Nielsen expands streaming ratings for advertisers', link: 'https://news.example.com/r3', publishedAt: at, snippet: '' },
    ];
    const { items: kept, stats: s } = entriesToItems(entries, NEWS, NOW);
    assert.equal(s.offTopic, 2);
    assert.deepEqual(kept.map((item) => item.title), ['Nielsen expands streaming ratings for advertisers']);
  });

  it('clamps future dates to now', () => {
    const { items: future } = entriesToItems(
      [{ title: 'From the future', link: 'https://news.example.com/future', publishedAt: new Date('2026-10-30T00:00:00Z'), snippet: 'x' }],
      NEWS,
      NOW,
    );
    assert.equal(future[0]?.publishedAt, '2026-10-25T21:00:00Z');
  });
});

describe('canonicalizeUrl', () => {
  it('drops utm_*, fbclid, gclid and the fragment, keeps other params', () => {
    assert.equal(
      canonicalizeUrl('https://Example.com/a/b?utm_source=x&id=7&UTM_Campaign=y&fbclid=1&gclid=2&q=a+b#section'),
      'https://example.com/a/b?id=7&q=a+b',
    );
    assert.equal(canonicalizeUrl('https://example.com/a?utm_source=rss'), 'https://example.com/a');
    assert.equal(canonicalizeUrl('https://example.com/a#top'), 'https://example.com/a');
    assert.equal(canonicalizeUrl('https://example.com/a?x=1'), 'https://example.com/a?x=1');
  });

  it('returns null for unsafe or relative urls', () => {
    assert.equal(canonicalizeUrl('javascript:alert(1)'), null);
    assert.equal(canonicalizeUrl('data:text/html,hi'), null);
    assert.equal(canonicalizeUrl('/a/b'), null);
  });

  it('gives the same id to tracking variants of a url', () => {
    const a = itemId(canonicalizeUrl('https://example.com/post?utm_source=a') as string);
    const b = itemId(canonicalizeUrl('https://example.com/post#x') as string);
    assert.equal(a, b);
    assert.match(a, /^[0-9a-f]{12}$/);
  });
});

describe('dedupe', () => {
  it('normalizes titles for near-identical matching', () => {
    assert.equal(normalizeTitle('  Meta’s NEW “Ads” tool — launches!  '), normalizeTitle('metas new ads tool launches'));
    assert.equal(normalizeTitle('Café Ads'), 'cafe ads');
  });

  it('keeps the earliest item for the same url across sources', () => {
    const late = makeItem({ url: 'https://example.com/story', source: 'B', publishedAt: '2026-10-25T10:00:00Z', title: 'Story one' });
    const early = makeItem({ url: 'https://example.com/story', source: 'A', publishedAt: '2026-10-25T08:00:00Z', title: 'Story one (syndicated)' });
    const kept = dedupeItems([late, early]);
    assert.equal(kept.length, 1);
    assert.equal(kept[0]?.source, 'A');
  });

  it('keeps the earliest item for near-identical titles', () => {
    const a = makeItem({ title: 'Google expands Demand Gen to all advertisers', publishedAt: '2026-10-25T09:00:00Z', source: 'Digiday' });
    const b = makeItem({ title: 'Google Expands Demand Gen To All Advertisers!', publishedAt: '2026-10-25T07:00:00Z', source: 'PPC Land' });
    const c = makeItem({ title: 'Something else entirely', publishedAt: '2026-10-25T06:00:00Z' });
    const kept = dedupeItems([a, b, c]);
    assert.deepEqual(kept.map((item) => item.source).sort(), ['PPC Land', c.source].sort());
  });

  it('merges into state without replacing existing (possibly enriched) items', () => {
    const existing = makeItem({ title: 'Existing story', enriched: true });
    const sameUrl = { ...makeItem({ title: 'Existing story, updated title' }), id: existing.id, url: existing.url, enriched: false };
    const sameTitle = makeItem({ title: 'existing STORY' });
    const fresh = makeItem({ title: 'Brand new story' });
    const { items, added } = mergeNewItems([existing], [sameUrl, sameTitle, fresh]);
    assert.deepEqual(added.map((item) => item.title), ['Brand new story']);
    assert.equal(items.length, 2);
    assert.equal(items[0], existing);
  });
});

describe('ingestAll', () => {
  it('skips failing feeds, keeps the rest, and sends the polite User-Agent', async () => {
    const seen: { url: string; ua: string }[] = [];
    const fetchImpl = async (url: string, init?: RequestInit): Promise<Response> => {
      seen.push({ url, ua: (init?.headers as Record<string, string>)['user-agent'] ?? '' });
      if (url.includes('news.example.com')) return new Response(fixture('rss.xml'), { status: 200 });
      if (url.includes('platform.example.com')) return new Response(fixture('atom.xml'), { status: 200 });
      return new Response('blocked', { status: 403 });
    };
    const broken: SourceConfig = { name: 'Broken', section: 'expert', feedUrl: 'https://broken.example.com/feed', homeUrl: 'https://broken.example.com/' };
    const { items, reports } = await ingestAll([NEWS, PLATFORM, broken], { fetch: fetchImpl, now: NOW });
    assert.equal(items.length, 6);
    assert.deepEqual(reports.map((r) => [r.source, r.ok, r.parsed, r.recent]), [
      ['Fixture News', true, 9, 4],
      ['Fixture Platform', true, 3, 2],
      ['Broken', false, 0, 0],
    ]);
    assert.equal(reports[2]?.status, 403);
    assert.ok(seen.every((s) => s.ua === 'TodayAdTrendBot/1.0 (+https://todayadtrend.com)'));
  });
});

describe('snippet cleanup', () => {
  it('strips feed boilerplate tails', () => {
    const cases: [string, string][] = [
      ['Shopify absorbs the cost now. More', 'Shopify absorbs the cost now.'],
      ['Budgets shift to CTV. Read more »', 'Budgets shift to CTV.'],
      ['Budgets shift to CTV. Continue reading…', 'Budgets shift to CTV.'],
      ['Budgets shift to CTV. Continue reading "Why budgets shift" →', 'Budgets shift to CTV.'],
      ['Budgets shift to CTV. The second sentence is cut [...]', 'Budgets shift to CTV.'],
      ['Budgets shift to CTV. The second sentence is cut […]', 'Budgets shift to CTV.'],
      ['Budgets shift to CTV. The post Budgets shift appeared first on Example News.', 'Budgets shift to CTV.'],
      ['Budgets shift to CTV. This article originally appeared on Example News.', 'Budgets shift to CTV.'],
      ['Budgets shift to CTV. Originally published at example news.', 'Budgets shift to CTV.'],
      ['Budgets shift to CTV. Learn more', 'Budgets shift to CTV.'],
      ['Budgets shift to CTV. Read more The post X appeared first on Y.', 'Budgets shift to CTV.'],
    ];
    for (const [input, expected] of cases) assert.equal(cleanSnippet(input), expected, input);
  });

  it('keeps legitimate endings', () => {
    assert.equal(cleanSnippet('Advertisers want more'), 'Advertisers want more');
    assert.equal(cleanSnippet('How I AI, part of the Lenny’s Podcast Network'), 'How I AI, part of the Lenny’s Podcast Network');
  });

  it('ends cut-off text at the last full sentence', () => {
    assert.equal(
      cleanSnippet('Customers expect far more human effort and delight than most brands deliver. Teams relentlessly improve the productivity of the'),
      'Customers expect far more human effort and delight than most brands deliver.',
    );
    assert.equal(cleanSnippet('First sentence is complete. Second one ends with a cut…'), 'First sentence is complete.');
    assert.equal(cleanSnippet('A single long clause that the publisher cut off…'), 'A single long clause that the publisher cut off…');
  });

  it('truncates to the last full sentence within the limit', () => {
    const text = `${'Short sentence here. '.repeat(20)}Tail without end`;
    const out = truncateToSentence(text, 280);
    assert.ok(out.length <= 280);
    assert.ok(out.endsWith('here.'));
    const oneSentence = `${'word '.repeat(80)}end.`;
    const cut = truncateToSentence(oneSentence, 100);
    assert.ok(cut.length <= 100 && cut.endsWith('…'), 'no sentence break: word boundary with an ellipsis');
  });

  it('fallback summaries end at a sentence boundary', () => {
    const snippet = cleanSnippet(`${'The holiday quarter starts early this year. '.repeat(8)}And this final clause gets`);
    const { items } = entriesToItems([{ title: 'Holiday plans', link: 'https://news.example.com/h', publishedAt: new Date('2026-10-25T10:00:00Z'), snippet }], NEWS, NOW);
    assert.ok(items[0]?.summary.endsWith('this year.'));
    assert.ok((items[0]?.summary.length ?? 0) <= 280);
  });
});

describe('non-news entries', () => {
  it('detects glossary pages: <= 4 words, no headline verb, slug equals the slugified title', () => {
    assert.equal(isGlossaryEntry('Deals API', 'https://ppc.land/deals-api/'), true);
    assert.equal(isGlossaryEntry('AAMP', 'https://ppc.land/aamp/'), true);
    assert.equal(isGlossaryEntry('EU AI Act', 'https://ppc.land/eu-ai-act/'), true);
    assert.equal(isGlossaryEntry('Customer journey tracking', 'https://ppc.land/customer-journey-tracking/'), true);
    assert.equal(isGlossaryEntry('Value-based bidding', 'https://ppc.land/value-based-bidding/'), true);
    assert.equal(isGlossaryEntry('Meta launches Reels ads', 'https://ppc.land/meta-launches-reels-ads/'), false, 'has a verb');
    assert.equal(isGlossaryEntry('Google delayed cookie deprecation', 'https://ppc.land/google-delayed-cookie-deprecation/'), false, '-ed verb');
    assert.equal(isGlossaryEntry('Spotify direct ad sales fall €53m as automated buying lifts growth', 'https://ppc.land/spotifys-direct-ad-sales-fall-eur53m/'), false, 'long title');
    assert.equal(isGlossaryEntry('Deals API', 'https://ppc.land/2026/10/news-1234/'), false, 'slug differs');
  });

  it('detects puzzle posts', () => {
    assert.equal(isPuzzleTitle('Game: Half the trade’s jargon exists to explain what broke'), true);
    assert.equal(isPuzzleTitle('Gaming ad spend grows'), false);
  });

  it('drops glossary entries from news sources only, and puzzles everywhere', () => {
    const at = new Date('2026-10-25T10:00:00Z');
    const entries = [
      { title: 'Deals API', link: 'https://ppc.land/deals-api/', publishedAt: at, snippet: '' },
      { title: 'Game: Nobody warns a new hire', link: 'https://ppc.land/game-nobody-warns/', publishedAt: at, snippet: '' },
      { title: 'Google Ads lets retailers multiply new customer values', link: 'https://ppc.land/google-ads-lets-retailers/', publishedAt: at, snippet: '' },
    ];
    const news = entriesToItems(entries, NEWS, NOW);
    assert.equal(news.stats.nonNews, 2);
    assert.deepEqual(news.items.map((i) => i.title), ['Google Ads lets retailers multiply new customer values']);
    const expertSource: SourceConfig = { name: 'Seth Godin', section: 'expert', feedUrl: 'https://seths.blog/feed/', homeUrl: 'https://seths.blog/' };
    const expert = entriesToItems([{ title: 'Mirrors and windows', link: 'https://seths.blog/2026/10/mirrors-and-windows/', publishedAt: at, snippet: '' }], expertSource, NOW);
    assert.equal(expert.items.length, 1, 'short essay titles on expert blogs are kept');
  });
});

describe('per-source daily cap at ingest', () => {
  it('admits at most 12 items per source per UTC day, most recent first, counting state', () => {
    const day = (h: number): string => `2026-10-24T${String(h).padStart(2, '0')}:00:00Z`;
    const existing = Array.from({ length: 5 }, (_, i) => makeItem({ source: 'PPC Land', publishedAt: day(i), title: `Existing ${i}` }));
    const incoming = Array.from({ length: 10 }, (_, i) => makeItem({ source: 'PPC Land', publishedAt: day(10 + i), title: `Incoming ${i}` }));
    const otherDay = makeItem({ source: 'PPC Land', publishedAt: '2026-10-23T12:00:00Z', title: 'Other day' });
    const otherSource = makeItem({ source: 'Digiday', publishedAt: day(12), title: 'Other source' });
    const { added, capped } = mergeNewItems(existing, [...incoming, otherDay, otherSource]);
    assert.equal(capped, 3);
    const titles = added.map((item) => item.title);
    assert.deepEqual(titles.filter((t) => t.startsWith('Incoming')).sort(), ['Incoming 3', 'Incoming 4', 'Incoming 5', 'Incoming 6', 'Incoming 7', 'Incoming 8', 'Incoming 9']);
    assert.ok(titles.includes('Other day') && titles.includes('Other source'));
  });

  it('capPerSourceDay keeps input order and uses the given ranking', () => {
    const items = Array.from({ length: 4 }, (_, i) => makeItem({ source: 'S', publishedAt: `2026-10-24T0${i}:00:00Z`, importance: (i + 1) as 1 | 2 | 3 | 4 }));
    const kept = capPerSourceDay(items, 2, (a, b) => b.importance - a.importance);
    assert.deepEqual(kept.map((i) => i.importance), [3, 4]);
  });
});

describe('helpers', () => {
  it('parseFeedDate does not depend on the host time zone', () => {
    assert.equal(parseFeedDate('October 06, 2026')?.toISOString(), '2026-10-06T00:00:00.000Z');
    assert.equal(parseFeedDate('2026-10-06')?.toISOString(), '2026-10-06T00:00:00.000Z');
    assert.equal(parseFeedDate('2026-10-06T10:00:00')?.toISOString(), '2026-10-06T10:00:00.000Z');
    assert.equal(parseFeedDate('Thu, 22 Oct 2026 08:56:36 -0700')?.toISOString(), '2026-10-22T15:56:36.000Z');
    assert.equal(parseFeedDate('not a date'), null);
  });

  it('detects and strips links, markup and control characters in untrusted text', () => {
    for (const bad of ['see https://x.example', 'ftp://x/y', 'myapp://open', 'javascript:alert(1)', 'data:text/html,x', 'www.evil.example/x', '<b>hi</b>', '<!-- c -->', '[a](b)', '![img](x.png)']) {
      assert.equal(containsLinkOrMarkup(bad), true, bad);
    }
    for (const ok of ['Booking.com grows CTV spend', 'First-party data: why it matters', 'a < b and c > d', 'Q3 [preview] numbers']) {
      assert.equal(containsLinkOrMarkup(ok), false, ok);
    }
    assert.equal(stripLinksAndMarkup('Read [the guide](https://x.example) at https://x.example/p or www.x.example/q <b>now</b>.'), 'Read the guide at or now.');
    assert.equal(stripControlChars('a\u0000b\u0007c‮d​e\nf'), 'a b c d e f');
  });

  it('removes URLs and markdown links from feed titles and snippets', () => {
    const xml = `<rss><channel><item><title>Big news [here](https://evil.example/t)</title><link>https://news.example.com/x</link>
      <pubDate>Sun, 25 Oct 2026 10:00:00 +0000</pubDate><description>Details at https://evil.example/d and www.evil.example/w.</description></item></channel></rss>`;
    const [entry] = parseFeed(xml);
    const { items } = entriesToItems(entry ? [entry] : [], NEWS, NOW);
    assert.equal(items[0]?.title, 'Big news here');
    assert.ok(!JSON.stringify(items).includes('evil.example'));
  });

  it('stripHtml handles double-escaped markup', () => {
    assert.equal(stripHtml('&lt;p&gt;Ben &amp;amp; Jerry&amp;#8217;s&lt;/p&gt;'), 'Ben & Jerry’s');
    assert.equal(stripHtml('<p>a < b and c > d</p>'), 'a < b and c > d');
  });
});
