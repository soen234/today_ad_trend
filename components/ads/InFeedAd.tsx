import { useState } from 'react';
import { View, Text } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, TEST_AD_UNIT_IDS } from '@/lib/admob';

interface InFeedAdProps {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
}

export function InFeedAd({ onAdLoaded, onAdFailedToLoad }: InFeedAdProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Use production ID first, fallback to test ID if it fails
  const adUnitId = useFallback
    ? (TEST_AD_UNIT_IDS.banner || TestIds.BANNER)
    : (AD_UNIT_IDS.banner || TestIds.BANNER);

  if (hasError) {
    return null;
  }

  return (
    <View
      className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-3 ${
        !isLoaded ? 'min-h-[280px]' : ''
      }`}
    >
      {/* Ad Label - Required by AdMob policy */}
      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center">
          <View className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Sponsored
            </Text>
          </View>
        </View>
      </View>

      {/* Ad Content */}
      <View className="items-center justify-center pb-3">
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.MEDIUM_RECTANGLE}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {
            setIsLoaded(true);
            onAdLoaded?.();
          }}
          onAdFailedToLoad={(error) => {
            if (!useFallback) {
              // Try fallback to test ad
              setUseFallback(true);
            } else {
              // Both failed, hide the ad
              setHasError(true);
              onAdFailedToLoad?.(error);
            }
          }}
        />
      </View>
    </View>
  );
}
