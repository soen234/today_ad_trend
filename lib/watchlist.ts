import type { Item } from '@/types';

export const normalizeKeyword = (raw: string): string => raw.trim().replace(/\s+/g, ' ').slice(0, 40);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 단어 경계 기준으로 매칭해서 "meta"가 "metadata"에 걸리지 않게 한다
export const keywordPattern = (keyword: string): RegExp =>
  new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(keyword)}($|[^\\p{L}\\p{N}])`, 'iu');

export interface CompiledKeyword {
  keyword: string;
  pattern: RegExp;
}

// 워치리스트가 바뀔 때 한 번만 컴파일하고, 아이템마다 재사용한다
export const compileWatchlist = (keywords: string[]): CompiledKeyword[] =>
  keywords.map((keyword) => ({ keyword, pattern: keywordPattern(keyword) }));

export const matchCompiled = (item: Item, compiled: CompiledKeyword[]): string[] => {
  if (compiled.length === 0) return [];
  const haystack = [item.title, item.summary, item.source, ...item.tags, ...item.platforms].join(' \n ');
  return compiled.filter((c) => c.pattern.test(haystack)).map((c) => c.keyword);
};

export const matchedKeywords = (item: Item, keywords: string[]): string[] =>
  matchCompiled(item, compileWatchlist(keywords));
