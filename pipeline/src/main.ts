// Today Ad Trend pipeline CLI.
//
//   node src/main.ts --state-dir <dir> --out-dir <dir> [--force-edition] [--force-pulse] [--now <ISO>] [--pulse-shards <n>]
//
// Env: ANTHROPIC_API_KEY, LLM_MODEL, LLM_EFFORT, LLM_DISABLED=1 (no LLM calls; fallbacks only).
import { realpathSync } from 'node:fs';
import { appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { INGEST, SOURCES } from './config.ts';
import { buildEditions, editionTargetDate, mergeEditions, shouldBuildEdition } from './edition.ts';
import { enrichItems } from './enrich.ts';
import type { EnrichReport } from './enrich.ts';
import { ingestAll, mergeNewItems } from './ingest.ts';
import type { FeedReport } from './ingest.ts';
import { createLlmClient, llmConfigFromEnv } from './llm.ts';
import { buildOutputs, writeOutputs } from './publish.ts';
import { pulseItemId, runPulse, shouldRebuildPulse } from './pulse.ts';
import { loadState, pruneState, saveState } from './state.ts';
import type { CreativePulse, Edition, StoredItem } from './types.ts';
import { errorMessage, log, toIso, warn } from './util.ts';
import { validateOutputs } from './validate.ts';

interface RunSummary {
  feeds: (FeedReport & { added: number })[];
  enrich: EnrichReport;
  pulse: { built: boolean; reason: string; sample?: CreativePulse['sample']; error?: string };
  edition: { built: boolean; reason: string; targetDate: string; editions: Edition[] };
  outputs: number;
}

function parseCli(argv: string[]) {
  const { values } = parseArgs({
    args: argv,
    options: {
      'state-dir': { type: 'string', default: 'state' },
      'out-dir': { type: 'string', default: 'public' },
      'force-edition': { type: 'boolean', default: false },
      'force-pulse': { type: 'boolean', default: false },
      now: { type: 'string' },
      'pulse-shards': { type: 'string' },
    },
    strict: true,
  });
  const now = values.now ? new Date(values.now) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error(`invalid --now: ${values.now}`);
  const pulseShards = values['pulse-shards'] === undefined ? undefined : Number(values['pulse-shards']);
  if (pulseShards !== undefined && !(Number.isInteger(pulseShards) && pulseShards >= 1)) throw new Error(`invalid --pulse-shards: ${values['pulse-shards']}`);
  return {
    pulseShards,
    stateDir: values['state-dir'],
    outDir: values['out-dir'],
    forceEdition: values['force-edition'],
    forcePulse: values['force-pulse'],
    now,
  };
}

function upsertItem(items: StoredItem[], item: StoredItem): StoredItem[] {
  return [...items.filter((existing) => existing.id !== item.id), item];
}

export async function run(argv: string[]): Promise<number> {
  const args = parseCli(argv);
  const { now } = args;
  const llmConfig = llmConfigFromEnv(process.env);
  const llm = createLlmClient(llmConfig);
  log('run', `now=${toIso(now)} state=${args.stateDir} out=${args.outDir} llm=${llm.enabled ? llmConfig.model : `disabled (${llm.disabledReason})`}`);

  let state = await loadState(args.stateDir);
  log('state', `loaded ${state.items.length} items, ${state.editions.length} editions, pulse=${state.pulse ? state.pulse.weekStart : 'none'}`);

  // 1. Ingest. A run with zero successful feeds fails (spec §9).
  const ingest = await ingestAll(SOURCES, { now });
  if (!ingest.reports.some((report) => report.ok)) {
    console.error('[run] ERROR no feed could be fetched; aborting without writing');
    return 1;
  }
  const merged = mergeNewItems(state.items, ingest.items);
  state.items = merged.items;
  const addedBySource = new Map<string, number>();
  for (const item of merged.added) addedBySource.set(item.source, (addedBySource.get(item.source) ?? 0) + 1);
  log('ingest', `${merged.added.length} new items added to state, ${merged.capped} skipped by the ${INGEST.maxPerSourcePerDay}/day per-source cap`);

  // 2. Enrich (never fails the run).
  const enrich = await enrichItems(state.items, llm);

  // 3. Creative Pulse (weekly). Failures keep the previous pulse.
  const pulseDecision = shouldRebuildPulse(now, state.pulse, args.forcePulse);
  const pulseSummary: RunSummary['pulse'] = { built: false, reason: pulseDecision.reason };
  if (pulseDecision.build) {
    log('pulse', `rebuilding (${pulseDecision.reason})`);
    try {
      const result = await runPulse({ now, llm, shards: args.pulseShards });
      state.pulse = result.pulse;
      state.items = upsertItem(state.items, result.item);
      pulseSummary.built = true;
      pulseSummary.sample = result.pulse.sample;
    } catch (err) {
      pulseSummary.error = errorMessage(err);
      warn('pulse', `rebuild failed, keeping the previous pulse: ${pulseSummary.error}`);
    }
  } else {
    log('pulse', `skipped (${pulseDecision.reason})`);
  }

  // 4. Editions.
  const targetDate = editionTargetDate(now);
  const editionDecision = shouldBuildEdition(now, args.forceEdition, state.editions, targetDate);
  const editionSummary: RunSummary['edition'] = { built: false, reason: editionDecision.reason, targetDate, editions: [] };
  if (editionDecision.build) {
    log('edition', `building ${targetDate} (${editionDecision.reason})`);
    const pulseItem = state.pulse ? (state.items.find((item) => item.id === pulseItemId(state.pulse as CreativePulse)) ?? null) : null;
    const built = await buildEditions({ now, targetDate, items: state.items, editions: state.editions, pulseItem, llm });
    state.editions = mergeEditions(state.editions, built);
    editionSummary.built = built.length > 0;
    editionSummary.editions = built;
  } else {
    log('edition', `skipped (${editionDecision.reason})`);
  }

  // 5. Prune, build, validate, then write. An invalid build writes nothing.
  state = pruneState(state, now);
  const outputs = buildOutputs(state, now);
  const errors = validateOutputs(outputs);
  if (errors.length > 0) {
    console.error(`[validate] ERROR ${errors.length} contract violations; nothing was written:`);
    for (const error of errors.slice(0, 50)) console.error(`  - ${error}`);
    return 1;
  }
  await writeOutputs(args.outDir, outputs);
  await saveState(args.stateDir, state);
  log('publish', `wrote ${outputs.size} files to ${args.outDir}/v1; state saved (${state.items.length} items, ${state.editions.length} editions)`);

  const summary: RunSummary = {
    feeds: ingest.reports.map((report) => ({ ...report, added: addedBySource.get(report.source) ?? 0 })),
    enrich,
    pulse: pulseSummary,
    edition: editionSummary,
    outputs: outputs.size,
  };
  printSummary(summary);
  await writeStepSummary(summary);
  return 0;
}

function printSummary(summary: RunSummary): void {
  console.log('\nFeeds (parsed / last 7 days / new):');
  for (const feed of summary.feeds) {
    const status = feed.ok ? 'ok ' : 'ERR';
    console.log(`  ${status} ${feed.source.padEnd(36)} ${String(feed.parsed).padStart(4)} ${String(feed.recent).padStart(4)} ${String(feed.added).padStart(4)}${feed.error ? `  ${feed.error}` : ''}`);
  }
  const editions = summary.edition.editions.map((e) => `${e.role}=${e.items.length}`).join(' ');
  console.log(`Edition ${summary.edition.targetDate}: ${summary.edition.built ? editions : `not built (${summary.edition.reason})`}`);
  const sample = summary.pulse.sample;
  console.log(`Pulse: ${summary.pulse.built && sample ? `shards ${sample.shards}/${sample.totalShards}, creatives ${sample.creatives}, new this week ${sample.newThisWeek}, new prior week ${sample.newPriorWeek}` : `not rebuilt (${summary.pulse.error ?? summary.pulse.reason})`}`);
  console.log(`Enrich: ${summary.enrich.skippedReason ?? `requests ${summary.enrich.requests}, enriched ${summary.enrich.enriched}, failed ${summary.enrich.failed}`}`);
}

async function writeStepSummary(summary: RunSummary): Promise<void> {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  const rows = summary.feeds.map((f) => `| ${f.source} | ${f.ok ? 'ok' : `error: ${f.error ?? ''}`} | ${f.parsed} | ${f.recent} | ${f.added} |`);
  const sample = summary.pulse.sample;
  const lines = [
    '## Today Ad Trend pipeline',
    '',
    `Edition ${summary.edition.targetDate}: ${summary.edition.built ? summary.edition.editions.map((e) => `${e.role} ${e.items.length}`).join(', ') : `not built (${summary.edition.reason})`}`,
    '',
    `Pulse: ${summary.pulse.built && sample ? `${sample.shards}/${sample.totalShards} shards, ${sample.creatives} creatives, ${sample.newThisWeek} new this week` : `not rebuilt (${summary.pulse.error ?? summary.pulse.reason})`}`,
    '',
    `Enrichment: ${summary.enrich.skippedReason ?? `${summary.enrich.enriched} enriched in ${summary.enrich.requests} requests, ${summary.enrich.failed} failed`}`,
    '',
    '| Feed | Status | Parsed | Last 7 days | New |',
    '|---|---|---|---|---|',
    ...rows,
    '',
  ];
  try {
    await appendFile(file, lines.join('\n'));
  } catch (err) {
    warn('run', `could not write step summary: ${errorMessage(err)}`);
  }
}

function invokedDirectly(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(resolve(entry)) === realpathSync(import.meta.filename);
  } catch {
    return false;
  }
}

if (invokedDirectly()) {
  run(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (err: unknown) => {
      console.error(`[run] ERROR ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`);
      process.exitCode = 1;
    },
  );
}
