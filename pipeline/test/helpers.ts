// Shared test helpers (no tests here).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalizeUrl, itemId } from '../src/ingest.ts';
import { createLlmClient } from '../src/llm.ts';
import type { LlmClient } from '../src/llm.ts';
import type { Role, RoleTake, StoredItem } from '../src/types.ts';
import type { FetchLike } from '../src/util.ts';

export const FIXTURES = join(import.meta.dirname, 'fixtures');

export function fixture(name: string): string {
  return readFileSync(join(FIXTURES, name), 'utf8');
}

let counter = 0;

/** A valid stored item; override anything. The id is derived from the url unless given. */
export function makeItem(overrides: Partial<StoredItem> & { relevance?: Partial<Record<Role, RoleTake['relevance']>> } = {}): StoredItem {
  counter++;
  const { relevance, ...rest } = overrides;
  const url = rest.url ?? `https://news.example.com/post-${counter}`;
  const rel = { performance: 2, ua: 2, brand: 2, ...relevance } as Record<Role, RoleTake['relevance']>;
  const roles = {
    performance: { relevance: rel.performance, soWhat: rel.performance ? 'Test the new bidding control.' : '' },
    ua: { relevance: rel.ua, soWhat: rel.ua ? 'Review your postback setup.' : '' },
    brand: { relevance: rel.brand, soWhat: rel.brand ? 'Brief creative on the change.' : '' },
  };
  return {
    id: itemId(canonicalizeUrl(url) as string),
    section: 'news',
    title: `Item ${counter}`,
    url,
    source: `Source ${counter}`,
    publishedAt: '2026-10-25T12:00:00Z',
    summary: `Summary for item ${counter}.`,
    platforms: [],
    tags: [],
    importance: 3,
    roles,
    enriched: true,
    attempts: 0,
    ingestedAt: '2026-10-25T12:00:00Z',
    ...rest,
  };
}

export interface RecordedRequest { url: string; body: Record<string, unknown>; headers: Record<string, string> }

/** LLM client backed by a fake fetch; `respond` returns the assistant message content (or a Response). */
export function fakeLlm(respond: (body: Record<string, unknown>, call: number) => unknown, options: { disabled?: boolean } = {}): {
  llm: LlmClient;
  requests: RecordedRequest[];
  sleeps: number[];
} {
  const requests: RecordedRequest[] = [];
  const sleeps: number[] = [];
  let clock = 1_000_000;
  const fetchImpl: FetchLike = async (url, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    requests.push({ url, body, headers: init?.headers as Record<string, string> });
    const result = respond(body, requests.length);
    if (result instanceof Response) return result;
    const content = typeof result === 'string' ? result : JSON.stringify(result);
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const llm = createLlmClient(
    {
      baseUrl: 'https://llm.test/inference',
      model: 'test/model',
      apiKey: 'test-key',
      disabled: options.disabled ?? false,
      disabledReason: options.disabled ? 'LLM_DISABLED is set' : undefined,
      minIntervalMs: 4_500,
      timeoutMs: 5_000,
    },
    {
      fetch: fetchImpl,
      now: () => clock,
      sleep: async (ms) => {
        sleeps.push(ms);
        clock += ms;
      },
    },
  );
  return { llm, requests, sleeps };
}
