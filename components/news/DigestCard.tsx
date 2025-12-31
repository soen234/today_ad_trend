import { View, Text } from 'react-native';
import { Sparkles, TrendingUp, Zap, Globe, Bot } from 'lucide-react-native';
import { AdNewsDigest } from '@/types';

interface DigestCardProps {
  digest: AdNewsDigest;
}

export function DigestCard({ digest }: DigestCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const summary = digest.summary;

  return (
    <View className="bg-blue-600 rounded-2xl p-4 mb-4 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-2">
            <Bot size={18} color="white" />
          </View>
          <View>
            <Text className="text-white font-bold text-base">AI Summary</Text>
            <Text className="text-white/70 text-xs">{formatDate(digest.digest_date)}</Text>
          </View>
        </View>
        <View className="bg-white/20 px-2 py-1 rounded-full flex-row items-center">
          <Sparkles size={12} color="white" />
          <Text className="text-white/90 text-xs ml-1 font-medium">GPT-4</Text>
        </View>
      </View>

      {/* AI Summary Content */}
      {summary && (
        <View className="bg-white/10 rounded-xl p-3 mb-4">
          <Text className="text-white text-sm leading-6">
            {summary}
          </Text>
        </View>
      )}

      {/* Stats */}
      <View className="flex-row justify-between">
        <View className="items-center flex-1">
          <View className="flex-row items-center">
            <TrendingUp size={14} color="white" />
            <Text className="text-white font-bold text-lg ml-1">{digest.adtech_count || 0}</Text>
          </View>
          <Text className="text-white/60 text-xs">AdTech</Text>
        </View>

        <View className="items-center flex-1">
          <View className="flex-row items-center">
            <Zap size={14} color="white" />
            <Text className="text-white font-bold text-lg ml-1">{digest.martech_count || 0}</Text>
          </View>
          <Text className="text-white/60 text-xs">MarTech</Text>
        </View>

        <View className="items-center flex-1">
          <View className="flex-row items-center">
            <Globe size={14} color="white" />
            <Text className="text-white font-bold text-lg ml-1">{digest.general_count || 0}</Text>
          </View>
          <Text className="text-white/60 text-xs">General</Text>
        </View>

        <View className="items-center flex-1">
          <Text className="text-white font-bold text-lg">{digest.total_news_count || 0}</Text>
          <Text className="text-white/60 text-xs">Total</Text>
        </View>
      </View>
    </View>
  );
}
