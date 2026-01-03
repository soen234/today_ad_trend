import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Download } from 'lucide-react-native';
import { useScreenshot } from '@/hooks/useScreenshot';
import { AD_UNIT_IDS, TEST_AD_UNIT_IDS } from '@/lib/admob';

interface AdMobCardProps {
  size?: BannerAdSize;
}

export function AdMobCard({ size = BannerAdSize.MEDIUM_RECTANGLE }: AdMobCardProps) {
  const { viewRef, saveToGallery } = useScreenshot();
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Use production ID first, fallback to test ID if it fails
  const adUnitId = useFallback
    ? (TEST_AD_UNIT_IDS.banner || TestIds.BANNER)
    : (AD_UNIT_IDS.banner || TestIds.BANNER);

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Ad Content - Capturable Area */}
      <View ref={viewRef} collapsable={false}>
        <View className="items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-[250px]">
          {!hasError && (
            <BannerAd
              unitId={adUnitId}
              size={size}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
              onAdFailedToLoad={() => {
                if (!useFallback) {
                  setUseFallback(true);
                } else {
                  setHasError(true);
                }
              }}
            />
          )}
          {hasError && (
            <Text className="text-gray-400 text-sm">Ad unavailable</Text>
          )}
        </View>
      </View>

      {/* Action Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          Ad
        </Text>
        <Pressable
          onPress={saveToGallery}
          className="flex-row items-center gap-2 px-3 py-2 bg-blue-500 rounded-lg active:opacity-80"
        >
          <Download size={16} color="white" />
          <Text className="text-white text-sm font-medium">Save</Text>
        </Pressable>
      </View>
    </View>
  );
}
