import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Gift, Play, Coins } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-8143178103770527/2925233506';

export default function RewardedScreen() {
  const insets = useSafeAreaInsets();
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [earnedRewards, setEarnedRewards] = useState(0);
  const rewardedRef = useRef<RewardedAd | null>(null);

  useEffect(() => {
    // Create ad instance inside useEffect to avoid early initialization
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    rewardedRef.current = rewarded;

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
      setLoading(false);
    });

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        setEarnedRewards((prev) => prev + (reward.amount || 1));
        Alert.alert('Reward Earned!', `You earned ${reward.amount} ${reward.type}`);
      }
    );

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      // Reload after closed
      loadAd();
    });

    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
      setLoading(false);
      console.error('Rewarded ad error:', error);
    });

    // Initial load
    loadAd();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const loadAd = () => {
    setLoading(true);
    rewardedRef.current?.load();
  };

  const showAd = () => {
    if (loaded && rewardedRef.current) {
      rewardedRef.current.show();
    } else {
      Alert.alert('Not Ready', 'Ad is still loading. Please wait.');
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-amber-500 rounded-xl items-center justify-center">
            <Gift size={24} color="white" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Rewarded Ads
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Watch ads to earn rewards
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full items-center justify-center mb-6">
          <Gift size={48} color="#F59E0B" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Rewarded Ad
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
          Users choose to watch video ads{'\n'}
          in exchange for in-app rewards.
        </Text>

        {/* Rewards Counter */}
        <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 w-full mb-4 border border-amber-200 dark:border-amber-800">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Coins size={20} color="#F59E0B" />
              <Text className="text-amber-700 dark:text-amber-300 font-medium">
                Total Rewards Earned
              </Text>
            </View>
            <Text className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {earnedRewards}
            </Text>
          </View>
        </View>

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
            loaded ? 'bg-amber-500 active:opacity-80' : 'bg-gray-300 dark:bg-gray-700'
          }`}
        >
          <Play size={20} color="white" />
          <Text className="text-white font-semibold text-base">Watch Ad & Earn</Text>
        </Pressable>
      </View>
    </View>
  );
}
