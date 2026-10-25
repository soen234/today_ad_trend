import { Platform } from 'react-native';
import mobileAds, { TestIds } from 'react-native-google-mobile-ads';

// iOS 프로덕션 배너 유닛. Android는 아직 프로덕션 유닛/앱이 없어서 릴리스에서는 광고를 넣지 않는다.
const IOS_BANNER = 'ca-app-pub-8143178103770527/9888622328';

export const BANNER_UNIT_ID: string | undefined = __DEV__
  ? TestIds.BANNER
  : Platform.select({ ios: IOS_BANNER, default: undefined });

export const initAds = async (): Promise<void> => {
  if (!BANNER_UNIT_ID) return;
  await mobileAds().initialize();
};
