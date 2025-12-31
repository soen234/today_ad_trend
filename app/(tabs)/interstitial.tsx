import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Maximize, Play } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-8143178103770527/8770981770';

export default function InterstitialScreen() {
  const insets = useSafeAreaInsets();
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const interstitialRef = useRef<InterstitialAd | null>(null);

  useEffect(() => {
    // Create ad instance inside useEffect to avoid early initialization
    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    interstitialRef.current = interstitial;

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
      setLoading(false);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      // Reload after closed
      loadAd();
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      setLoading(false);
      console.error('Interstitial ad error:', error);
    });

    // Initial load
    loadAd();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const loadAd = () => {
    setLoading(true);
    interstitialRef.current?.load();
  };

  const showAd = () => {
    if (loaded && interstitialRef.current) {
      interstitialRef.current.show();
    } else {
      Alert.alert('Not Ready', 'Ad is still loading. Please wait.');
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-purple-500 rounded-xl items-center justify-center">
            <Maximize size={24} color="white" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Interstitial Ads
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Full-screen ads
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center mb-6">
          <Maximize size={48} color="#A855F7" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Interstitial Ad
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
          Full-screen ads that cover the entire interface.{'\n'}
          Best used at natural transition points.
        </Text>

        {/* Status */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 w-full mb-6 border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Status</Text>
            <View className="flex-row items-center gap-2">
              <View
                className={`w-3 h-3 rounded-full ${
                  loaded ? 'bg-green-500' : loading ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
              />
              <Text className="text-gray-900 dark:text-white font-medium">
                {loaded ? 'Ready' : loading ? 'Loading...' : 'Not loaded'}
              </Text>
            </View>
          </View>
        </View>

        {/* Button */}
        <Pressable
          onPress={showAd}
          disabled={!loaded}
          className={`w-full flex-row items-center justify-center gap-2 py-4 rounded-xl ${
            loaded ? 'bg-purple-500 active:opacity-80' : 'bg-gray-300 dark:bg-gray-700'
          }`}
        >
          <Play size={20} color="white" />
          <Text className="text-white font-semibold text-base">Show Ad</Text>
        </Pressable>
      </View>
    </View>
  );
}
