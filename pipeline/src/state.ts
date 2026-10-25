import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { STATE } from './config.ts';
import type { CreativePulse, Edition, PipelineState, StoredItem } from './types.ts';
import { DAY_MS } from './util.ts';

const FILES = { items: 'items.json', editions: 'editions.json', pulse: 'pulse.json' } as const;

async function readJson(file: string): Promise<unknown> {
  let text: string;
  try {
    text = await readFile(file, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw err;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch (err) {
    // Corrupt state must fail loudly rather than silently resetting history.
    throw new Error(`state file ${file} is not valid JSON: ${(err as Error).message}`);
  }
}

/** Loads state from `dir`; missing files mean an empty (first-run) state. */
export async function loadState(dir: string): Promise<PipelineState> {
  const [items, editions, pulse] = await Promise.all([
    readJson(join(dir, FILES.items)),
    readJson(join(dir, FILES.editions)),
    readJson(join(dir, FILES.pulse)),
  ]);
  if (items !== undefined && !Array.isArray(items)) throw new Error(`${FILES.items} must be an array`);
  if (editions !== undefined && !Array.isArray(editions)) throw new Error(`${FILES.editions} must be an array`);
  if (pulse !== undefined && pulse !== null && typeof pulse !== 'object') throw new Error(`${FILES.pulse} must be an object or null`);
  return {
    items: ((items ?? []) as StoredItem[]).map((item) => ({ ...item, attempts: item.attempts ?? 0 })),
    editions: (editions ?? []) as Edition[],
    pulse: (pulse ?? null) as CreativePulse | null,
  };
}

/** Compact JSON with one array element per line, so the `data` branch gets readable diffs. */
function jsonLines(values: readonly unknown[]): string {
  return values.length ? `[\n${values.map((v) => JSON.stringify(v)).join(',\n')}\n]\n` : '[]\n';
}

async function writeAtomic(file: string, content: string): Promise<void> {
  const tmp = `${file}.tmp`;
  await writeFile(tmp, content);
  await rename(tmp, file);
}

export async function saveState(dir: string, state: PipelineState): Promise<void> {
  await mkdir(dir, { recursive: true });
  const items = [...state.items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id));
  await writeAtomic(join(dir, FILES.items), jsonLines(items));
  await writeAtomic(join(dir, FILES.editions), jsonLines(state.editions));
  await writeAtomic(join(dir, FILES.pulse), `${JSON.stringify(state.pulse)}\n`);
}

/** Keeps items published in the last 30 days and the newest 30 edition dates. */
export function pruneState(state: PipelineState, now: Date): PipelineState {
  const minTime = now.getTime() - STATE.itemDays * DAY_MS;
  const dates = [...new Set(state.editions.map((e) => e.date))].sort().reverse().slice(0, STATE.editionDates);
  const keepDates = new Set(dates);
  return {
    items: state.items.filter((item) => Date.parse(item.publishedAt) >= minTime),
    editions: state.editions.filter((e) => keepDates.has(e.date)),
    pulse: state.pulse,
  };
}
