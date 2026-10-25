// Data contract for the static briefing API (`/v1`).
// Keep in sync with pipeline/src/types.ts and docs/superpowers/specs/2026-10-25-daily-briefing-design.md §4.

export type Role = 'performance' | 'ua' | 'brand';
export type Section = 'news' | 'platform' | 'expert' | 'creative';

export interface RoleTake {
  relevance: 0 | 1 | 2 | 3;
  soWhat: string;
}

export interface Item {
  id: string;
  section: Section;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  platforms: string[];
  tags: string[];
  importance: 1 | 2 | 3 | 4 | 5;
  roles: Record<Role, RoleTake>;
  imageUrl?: string;
  enriched: boolean;
}

export interface Edition {
  version: 1;
  date: string;
  role: Role;
  generatedAt: string;
  headline: string;
  items: Item[];
}

export interface PulseStat {
  label: string;
  share: number;
  deltaPt: number;
}

export interface CreativePulse {
  version: 1;
  generatedAt: string;
  weekStart: string;
  weekEnd: string;
  sample: {
    shards: number;
    totalShards: number;
    creatives: number;
    newThisWeek: number;
    newPriorWeek: number;
  };
  formatMix: PulseStat[];
  audienceSignals: PulseStat[];
  topLaunchers: { advertiser: string; newCreatives: number; exampleUrl: string }[];
  longRunners: { advertiser: string; format: string; firstShown: string; url: string }[];
  insights: string[];
}

export interface Feed {
  version: 1;
  generatedAt: string;
  items: Item[];
}

export interface Latest {
  version: 1;
  generatedAt: string;
  editionDate: string | null;
  editions: Record<Role, string | null>;
  feeds: Record<Section, string>;
  pulse: string | null;
  sources: { name: string; section: Section; url: string }[];
}
