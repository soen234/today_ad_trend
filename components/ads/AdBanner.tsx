import { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, TEST_AD_UNIT_IDS } from '@/lib/admob';

interface AdBannerProps {
  size?: BannerAdSize;
}

export function AdBanner({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }: AdBannerProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Use production ID first, fallback to test ID if it fails
  const adUnitId = useFallback
    ? (TEST_AD_UNIT_IDS.banner || TestIds.BANNER)
    : (AD_UNIT_IDS.banner || TestIds.BANNER);

  if (hasError) {
    return null;
  }

  return (
    <View className="items-center bg-gray-100 dark:bg-gray-800">
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
    </View>
  );
}
