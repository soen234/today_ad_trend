import { Platform } from 'react-native';

// Test Ad Unit IDs (for fallback)
export const TEST_AD_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: '',
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: '',
  }),
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: '',
  }),
  rewardedInterstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/6978759866',
    android: 'ca-app-pub-3940256099942544/5354046379',
    default: '',
  }),
  native: Platform.select({
    ios: 'ca-app-pub-3940256099942544/3986624511',
    android: 'ca-app-pub-3940256099942544/2247696110',
    default: '',
  }),
  appOpen: Platform.select({
    ios: 'ca-app-pub-3940256099942544/5575463023',
    android: 'ca-app-pub-3940256099942544/9257395921',
    default: '',
  }),
};

// Production Ad Unit IDs (iOS only for now)
export const PROD_AD_UNIT_IDS = {
  banner: 'ca-app-pub-8143178103770527/9888622328',
  interstitial: 'ca-app-pub-8143178103770527/8770981770',
  native: 'ca-app-pub-8143178103770527/2553714322',
  appOpen: 'ca-app-pub-8143178103770527/2529663599',
  rewarded: 'ca-app-pub-8143178103770527/2925233506',
  rewardedInterstitial: 'ca-app-pub-8143178103770527/5179877669',
};

// Get ad unit ID with fallback support
export const AD_UNIT_IDS = {
  banner: Platform.select({
    ios: __DEV__ ? TEST_AD_UNIT_IDS.banner : PROD_AD_UNIT_IDS.banner,
    android: TEST_AD_UNIT_IDS.banner, // Android uses test IDs for now
    default: '',
  }),
  interstitial: Platform.select({
    ios: __DEV__ ? TEST_AD_UNIT_IDS.interstitial : PROD_AD_UNIT_IDS.interstitial,
    android: TEST_AD_UNIT_IDS.interstitial,
    default: '',
  }),
  rewarded: Platform.select({
    ios: __DEV__ ? TEST_AD_UNIT_IDS.rewarded : PROD_AD_UNIT_IDS.rewarded,
    android: TEST_AD_UNIT_IDS.rewarded,
    default: '',
  }),
  rewardedInterstitial: Platform.select({
    ios: __DEV__ ? TEST_AD_UNIT_IDS.rewardedInterstitial : PROD_AD_UNIT_IDS.rewardedInterstitial,
    android: TEST_AD_UNIT_IDS.rewardedInterstitial,
    default: '',
  }),
  native: Platform.select({
    ios: __DEV__ ? TEST_AD_UNIT_IDS.native : PROD_AD_UNIT_IDS.native,
    android: TEST_AD_UNIT_IDS.native,
    default: '',
  }),
  appOpen: Platform.select({
    ios: __DEV__ ? TEST_AD_UNIT_IDS.appOpen : PROD_AD_UNIT_IDS.appOpen,
    android: TEST_AD_UNIT_IDS.appOpen,
    default: '',
  }),
};

// Get fallback ad unit ID (test ID)
export const getFallbackAdUnitId = (type: keyof typeof TEST_AD_UNIT_IDS): string => {
  return TEST_AD_UNIT_IDS[type] || '';
};
