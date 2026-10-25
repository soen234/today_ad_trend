import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ExternalLink, Info } from 'lucide-react-native';
import { COLORS } from '@/lib/config';
import { openUrl } from '@/lib/open';
import type { CreativePulse, PulseStat } from '@/types';

const pct = (share: number) => `${Math.round(share * 100)}%`;
const delta = (pt: number) => {
  const rounded = Math.round(pt * 10) / 10;
  if (rounded === 0) return '±0 pt';
  return `${rounded > 0 ? '+' : ''}${rounded} pt`;
};

const formatDay = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface PulseSectionProps {
  title: string;
  children: ReactNode;
}

const PulseSection = ({ title, children }: PulseSectionProps) => (
  <View className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-ink-700">
    <Text className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">{title}</Text>
    {children}
  </View>
);

interface StatBarProps {
  stat: PulseStat;
  color: string;
}

const StatBar = ({ stat, color }: StatBarProps) => (
  <View className="mb-3">
    <View className="flex-row justify-between mb-1">
      <Text className="text-sm font-medium text-gray-900 dark:text-white">{stat.label}</Text>
      <Text className="text-sm text-gray-600 dark:text-gray-300">
        {pct(stat.share)}{' '}
        <Text style={{ color: stat.deltaPt >= 0 ? COLORS.signal : COLORS.rose }}>{delta(stat.deltaPt)}</Text>
      </Text>
    </View>
    <View className="h-2 rounded-full bg-gray-100 dark:bg-ink-700 overflow-hidden">
      <View style={{ width: `${Math.max(2, Math.min(100, stat.share * 100))}%`, backgroundColor: color }} className="h-2 rounded-full" />
    </View>
  </View>
);

interface PulseViewProps {
  pulse: CreativePulse;
}

export const PulseView = ({ pulse }: PulseViewProps) => (
  <View>
    <View className="rounded-2xl p-4 mb-3 bg-ink">
      <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.rose }}>
        Creative Pulse · {formatDay(pulse.weekStart)} – {formatDay(pulse.weekEnd)}
      </Text>
      {pulse.insights.map((line, i) => (
        <Text key={i} className="text-[15px] leading-[22px] text-white mt-2">
          {line}
        </Text>
      ))}
    </View>

    {pulse.formatMix.length > 0 ? (
      <PulseSection title="Format mix of new creatives (vs. prior week)">
        {pulse.formatMix.map((s) => (
          <StatBar key={s.label} stat={s} color={COLORS.rose} />
        ))}
      </PulseSection>
    ) : null}

    {pulse.audienceSignals.length > 0 ? (
      <PulseSection title="Audience targeting used by new creatives">
        {pulse.audienceSignals.map((s) => (
          <StatBar key={s.label} stat={s} color={COLORS.violet} />
        ))}
      </PulseSection>
    ) : null}

    {pulse.topLaunchers.length > 0 ? (
      <PulseSection title="Most new creatives launched (sample)">
        {pulse.topLaunchers.map((l, i) => (
          <Pressable
            key={`${l.advertiser}-${i}`}
            onPress={() => openUrl(l.exampleUrl).catch(() => undefined)}
            accessibilityRole="link"
            className="flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-ink-700"
          >
            <Text className="text-sm text-gray-900 dark:text-white flex-1 pr-3" numberOfLines={1}>
              {i + 1}. {l.advertiser}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mr-2">{l.newCreatives}</Text>
            <ExternalLink size={14} color={COLORS.muted} />
          </Pressable>
        ))}
      </PulseSection>
    ) : null}

    {pulse.longRunners.length > 0 ? (
      <PulseSection title="Long runners: live 90+ days and still showing">
        {pulse.longRunners.map((r, i) => (
          <Pressable
            key={`${r.url}-${i}`}
            onPress={() => openUrl(r.url).catch(() => undefined)}
            accessibilityRole="link"
            className="flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-ink-700"
          >
            <View className="flex-1 pr-3">
              <Text className="text-sm text-gray-900 dark:text-white" numberOfLines={1}>
                {r.advertiser}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {r.format.toLowerCase()} · since {formatDay(r.firstShown)}
              </Text>
            </View>
            <ExternalLink size={14} color={COLORS.muted} />
          </Pressable>
        ))}
      </PulseSection>
    ) : null}

    <View className="flex-row px-1 mb-4">
      <Info size={14} color={COLORS.muted} style={{ marginTop: 2 }} />
      <Text className="text-xs leading-[18px] text-gray-500 dark:text-gray-400 ml-1.5 flex-1">
        Estimated from a random sample of {pulse.sample.creatives.toLocaleString('en-US')} creatives ({pulse.sample.shards} of{' '}
        {pulse.sample.totalShards} data files) in the Google Ads Transparency Center, which covers ads shown in the EEA and
        Turkey. Numbers are sample-based estimates, not totals.
      </Text>
    </View>
  </View>
);
