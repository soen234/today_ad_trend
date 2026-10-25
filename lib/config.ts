import type { Role, Section } from '@/types';

// 파이프라인이 GitHub Pages에 배포하는 정적 JSON (pipeline/, .github/workflows/pipeline.yml)
export const DATA_BASE_URL = 'https://soen234.github.io/today_ad_trend/v1';

export const WEBSITE_URL = 'https://todayadtrend.com';
export const PRIVACY_URL = `${WEBSITE_URL}/privacy`;
export const CONTACT_EMAIL = 'soen234@gmail.com';

export const COLORS = {
  ink: '#0B1B2B',
  signal: '#12B76A',
  sky: '#2E90FA',
  amber: '#F79009',
  violet: '#7A5AF8',
  rose: '#EE46BC',
  muted: '#98A2B3',
} as const;

export interface RoleMeta {
  key: Role;
  label: string;
  short: string;
  description: string;
}

export const ROLES: RoleMeta[] = [
  {
    key: 'performance',
    label: 'Performance marketer',
    short: 'Performance',
    description: 'Paid social & search. You live in CPA, ROAS and bid strategies.',
  },
  {
    key: 'ua',
    label: 'UA / App marketer',
    short: 'UA',
    description: 'App installs, MMPs, SKAN & AdAttributionKit, app ad networks.',
  },
  {
    key: 'brand',
    label: 'Brand & creative marketer',
    short: 'Brand',
    description: 'Messaging, creative, campaigns and what competitors are running.',
  },
];

export const roleMeta = (role: Role): RoleMeta => ROLES.find((r) => r.key === role) ?? ROLES[0];

export interface SectionMeta {
  key: Section;
  label: string;
  color: string;
}

export const SECTIONS: SectionMeta[] = [
  { key: 'news', label: 'News', color: COLORS.sky },
  { key: 'platform', label: 'Platforms', color: COLORS.signal },
  { key: 'expert', label: 'Experts', color: COLORS.violet },
  { key: 'creative', label: 'Creative Pulse', color: COLORS.rose },
];

export const sectionMeta = (section: Section): SectionMeta =>
  SECTIONS.find((s) => s.key === section) ?? SECTIONS[0];
