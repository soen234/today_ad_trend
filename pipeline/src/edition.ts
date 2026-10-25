import { EDITION, ROLE_INFO, ROLES } from './config.ts';
import type { LlmClient } from './llm.ts';
import { toPublicItem } from './publish.ts';
import type { Edition, Item, Role } from './types.ts';
import { HOUR_MS, collapseWhitespace, log, toIso, truncate, warn, ymd } from './util.ts';

/** Target date = UTC date of (now + 3h). The 21:00 UTC run therefore builds tomorrow's edition. */
export function editionTargetDate(now: Date): string {
  return ymd(new Date(now.getTime() + EDITION.dateOffsetHours * HOUR_MS));
}

export function shouldBuildEdition(now: Date, force: boolean, editions: readonly Edition[], targetDate: string): { build: boolean; reason: string } {
  if (force) return { build: true, reason: '--force-edition' };
  if (now.getUTCHours() === EDITION.buildHourUtc) return { build: true, reason: 'scheduled 21:00 UTC run' };
  if (!editions.some((edition) => edition.date === targetDate)) return { build: true, reason: `no edition yet for ${targetDate}` };
  return { build: false, reason: `edition for ${targetDate} exists` };
}

/** freshness: 2 (< 12 h), 1 (< 24 h), 0 otherwise. */
export function freshness(publishedAt: string, cut: Date): 0 | 1 | 2 {
  const ageHours = (cut.getTime() - Date.parse(publishedAt)) / HOUR_MS;
  if (ageHours < 12) return 2;
  if (ageHours < 24) return 1;
  return 0;
}

/** Score = importance × 2 + relevance × 3 + freshness (spec §5). */
export function scoreItem(item: Item, role: Role, cut: Date): number {
  return item.importance * 2 + item.roles[role].relevance * 3 + freshness(item.publishedAt, cut);
}

export interface SelectionInput {
  role: Role;
  /** Edition cut: the run time. Candidates are items published in the 48 h before it. */
  cut: Date;
  targetDate: string;
  items: readonly Item[];
  /** All known editions; the role's two most recent editions before `targetDate` are excluded. */
  editions: readonly Edition[];
  /** Synthetic Creative Pulse item (publishedAt = pulse generatedAt), if any. */
  pulseItem: Item | null;
}

interface Scored { item: Item; score: number }

function byScore(a: Scored, b: Scored): number {
  return b.score - a.score || b.item.publishedAt.localeCompare(a.item.publishedAt) || a.item.id.localeCompare(b.item.id);
}

// 다양성 캡을 지키며 점수순으로 고른다.
// 1) 플랫폼 후보가 하나라도 있으면 가장 점수 높은 플랫폼 아이템을 먼저 확보한다.
// 2) 섹션당 최대 3개, 출처당 최대 2개를 지키며 target개까지 채운다.
// 3) 그래도 min개에 못 미치면 캡을 풀고 남은 후보를 점수순으로 채운다 ("minimum 5 when available").
function pickWithCaps(sorted: readonly Scored[], target: number, min: number): Scored[] {
  const picked: Scored[] = [];
  const pickedIds = new Set<string>();
  const perSection = new Map<string, number>();
  const perSource = new Map<string, number>();
  const take = (c: Scored): void => {
    picked.push(c);
    pickedIds.add(c.item.id);
    perSection.set(c.item.section, (perSection.get(c.item.section) ?? 0) + 1);
    perSource.set(c.item.source, (perSource.get(c.item.source) ?? 0) + 1);
  };
  const fitsCaps = (c: Scored): boolean =>
    (perSection.get(c.item.section) ?? 0) < EDITION.maxPerSection && (perSource.get(c.item.source) ?? 0) < EDITION.maxPerSource;

  const bestPlatform = sorted.find((c) => c.item.section === 'platform');
  if (bestPlatform && target > 0) take(bestPlatform);
  for (const c of sorted) {
    if (picked.length >= target) break;
    if (!pickedIds.has(c.item.id) && fitsCaps(c)) take(c);
  }
  for (const c of sorted) {
    if (picked.length >= min) break;
    if (!pickedIds.has(c.item.id)) take(c);
  }
  return picked.sort(byScore);
}

/**
 * Deterministic edition selection (spec §5). Returns the ordered items, or null when fewer than
 * 5 items are available even after relaxing the caps and widening the window to 7 days.
 */
export function selectEditionItems(input: SelectionInput): Item[] | null {
  const { role, cut } = input;
  // 같은 역할의 직전 두 에디션(대상 날짜 이전)에 쓰인 아이템은 제외한다.
  const previous = input.editions
    .filter((edition) => edition.role === role && edition.date < input.targetDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, EDITION.previousEditionsExcluded);
  const excluded = new Set(previous.flatMap((edition) => edition.items.map((item) => item.id)));

  // 펄스가 컷 기준 24시간 이내에 재생성됐으면 합성 creative 아이템을 넣는다 (brand는 맨 앞, 나머지는 맨 뒤).
  const pulseAgeMs = input.pulseItem ? cut.getTime() - Date.parse(input.pulseItem.publishedAt) : Number.POSITIVE_INFINITY;
  const pulse = input.pulseItem && pulseAgeMs < EDITION.pulseFreshHours * HOUR_MS && !excluded.has(input.pulseItem.id) ? input.pulseItem : null;

  const regularTarget = Math.min(EDITION.target, EDITION.max - (pulse ? 1 : 0));
  const regularMin = EDITION.min - (pulse ? 1 : 0);

  let picks: Scored[] = [];
  for (const windowHours of [EDITION.windowHours, EDITION.fallbackWindowHours]) {
    const from = cut.getTime() - windowHours * HOUR_MS;
    const candidates = input.items
      .filter((item) => {
        if (item.section === 'creative' || excluded.has(item.id)) return false;
        if (item.roles[role].relevance === 0) return false;
        const t = Date.parse(item.publishedAt);
        return t > from && t <= cut.getTime();
      })
      .map((item) => ({ item, score: scoreItem(item, role, cut) }))
      .sort(byScore);
    picks = pickWithCaps(candidates, regularTarget, regularMin);
    if (picks.length >= regularMin) break;
  }
  if (picks.length < regularMin) return null;

  const ordered = picks.map((c) => c.item);
  if (pulse) {
    if (role === 'brand') ordered.unshift(pulse);
    else ordered.push(pulse);
  }
  return ordered;
}

// ---------------------------------------------------------------------------
// Headlines

export function fallbackHeadline(role: Role, items: readonly Item[]): string {
  const first = items[0]?.title ?? '';
  return truncate(`Today's top ${items.length} for ${ROLE_INFO[role].label}: ${first}`, EDITION.headlineMaxChars);
}

const HEADLINE_PROMPT = [
  'You write the headline for a daily advertising-industry brief, one per audience.',
  `Each headline: exactly one plain sentence, <= ${EDITION.headlineMaxChars} characters, factual, no hype, no emojis, no surrounding quotes.`,
  'Frame what matters most in that audience\'s items today. Use only the information given.',
  'Reply with JSON only: {"performance":"...","ua":"...","brand":"..."} with a key for every audience in the input.',
].join('\n');

/** One LLM request for all role headlines; any missing or invalid headline uses the template. */
export async function generateHeadlines(llm: LlmClient, drafts: Partial<Record<Role, Item[]>>): Promise<Partial<Record<Role, string>>> {
  const roles = ROLES.filter((role) => drafts[role]?.length);
  const headlines: Partial<Record<Role, string>> = {};
  for (const role of roles) headlines[role] = fallbackHeadline(role, drafts[role] ?? []);
  if (!llm.enabled || roles.length === 0) return headlines;

  const payload: Record<string, unknown> = {};
  for (const role of roles) {
    payload[role] = {
      audience: `${ROLE_INFO[role].label} (${ROLE_INFO[role].description})`,
      items: (drafts[role] ?? []).map((item) => ({ title: item.title, soWhat: item.roles[role].soWhat || undefined })),
    };
  }
  const response = await llm.completeJson(
    [
      { role: 'system', content: HEADLINE_PROMPT },
      { role: 'user', content: JSON.stringify(payload) },
    ],
    'headline',
  );
  let fromLlm = 0;
  if (typeof response === 'object' && response !== null) {
    for (const role of roles) {
      const value = (response as Record<string, unknown>)[role];
      if (typeof value !== 'string') continue;
      const text = collapseWhitespace(value).replace(/^["“]|["”]$/g, '');
      if (text.length > 0 && text.length <= EDITION.headlineMaxChars) {
        headlines[role] = text;
        fromLlm++;
      }
    }
  }
  if (fromLlm < roles.length) warn('edition', `headline: ${fromLlm}/${roles.length} from LLM, rest use the template`);
  return headlines;
}

export interface BuildEditionsInput {
  now: Date;
  targetDate: string;
  items: readonly Item[];
  editions: readonly Edition[];
  pulseItem: Item | null;
  llm: LlmClient;
}

/** Builds one edition per role for `targetDate`. Roles that cannot reach 5 items are skipped. */
export async function buildEditions(input: BuildEditionsInput): Promise<Edition[]> {
  const drafts: Partial<Record<Role, Item[]>> = {};
  for (const role of ROLES) {
    const items = selectEditionItems({
      role,
      cut: input.now,
      targetDate: input.targetDate,
      items: input.items,
      editions: input.editions,
      pulseItem: input.pulseItem,
    });
    if (items) drafts[role] = items;
    else warn('edition', `${role}: fewer than ${EDITION.min} candidates, keeping the previous edition`);
  }
  const headlines = await generateHeadlines(input.llm, drafts);
  const editions: Edition[] = [];
  for (const role of ROLES) {
    const items = drafts[role];
    if (!items) continue;
    editions.push({
      version: 1,
      date: input.targetDate,
      role,
      generatedAt: toIso(input.now),
      headline: headlines[role] ?? fallbackHeadline(role, items),
      items: items.map(toPublicItem),
    });
  }
  log('edition', `built ${input.targetDate}: ${editions.map((e) => `${e.role}=${e.items.length}`).join(' ') || 'none'}`);
  return editions;
}

/** Replaces editions with the same (date, role) and returns the merged list, newest first. */
export function mergeEditions(existing: readonly Edition[], built: readonly Edition[]): Edition[] {
  const key = (e: Edition): string => `${e.date}/${e.role}`;
  const replaced = new Set(built.map(key));
  return [...existing.filter((e) => !replaced.has(key(e))), ...built].sort(
    (a, b) => b.date.localeCompare(a.date) || ROLES.indexOf(a.role) - ROLES.indexOf(b.role),
  );
}
