import { useState } from 'react';
import { Text, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BANNER_UNIT_ID } from '@/lib/admob';

// Explore 목록 사이에만 들어가는 배너. 실패하면 자리를 접는다 (프로덕션에서 테스트 광고로 대체하지 않음).
export const InFeedAd = () => {
  const [failed, setFailed] = useState(false);
  if (failed || !BANNER_UNIT_ID) return null;

  return (
    <View className="bg-white dark:bg-ink-800 rounded-2xl mb-3 border border-gray-100 dark:border-ink-700 overflow-hidden items-center pb-3">
      <Text className="self-start text-[11px] font-medium text-gray-400 px-4 pt-2.5 pb-2">Sponsored</Text>
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
};
