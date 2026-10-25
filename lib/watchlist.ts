import type { Item } from '@/types';

export const normalizeKeyword = (raw: string): string => raw.trim().replace(/\s+/g, ' ').slice(0, 40);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 단어 경계 기준으로 매칭해서 "meta"가 "metadata"에 걸리지 않게 한다.
export const keywordPattern = (keyword: string): RegExp =>
  new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(keyword)}($|[^\\p{L}\\p{N}])`, 'iu');

export const matchedKeywords = (item: Item, keywords: string[]): string[] => {
  if (keywords.length === 0) return [];
  const haystack = [item.title, item.summary, item.source, ...item.tags, ...item.platforms].join(' \n ');
  return keywords.filter((k) => keywordPattern(k).test(haystack));
};
