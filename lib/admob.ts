import { Platform } from 'react-native';

const isDev = __DEV__;

export const AD_UNIT_IDS = {
  banner: Platform.select({
    ios: isDev
      ? 'ca-app-pub-3940256099942544/2934735716'
      : 'ca-app-pub-xxxxx/xxxxx',
    android: isDev
      ? 'ca-app-pub-3940256099942544/6300978111'
      : 'ca-app-pub-xxxxx/xxxxx',
    default: '',
  }),
  interstitial: Platform.select({
    ios: isDev
      ? 'ca-app-pub-3940256099942544/4411468910'
      : 'ca-app-pub-xxxxx/xxxxx',
    android: isDev
      ? 'ca-app-pub-3940256099942544/1033173712'
      : 'ca-app-pub-xxxxx/xxxxx',
    default: '',
  }),
  rewarded: Platform.select({
    ios: isDev
      ? 'ca-app-pub-3940256099942544/1712485313'
      : 'ca-app-pub-xxxxx/xxxxx',
    android: isDev
      ? 'ca-app-pub-3940256099942544/5224354917'
      : 'ca-app-pub-xxxxx/xxxxx',
    default: '',
  }),
  appOpen: Platform.select({
    ios: isDev
      ? 'ca-app-pub-3940256099942544/5575463023'
      : 'ca-app-pub-xxxxx/xxxxx',
    android: isDev
      ? 'ca-app-pub-3940256099942544/9257395921'
      : 'ca-app-pub-xxxxx/xxxxx',
    default: '',
  }),
};
