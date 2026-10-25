import { Platform } from 'react-native';
import mobileAds, { TestIds } from 'react-native-google-mobile-ads';

// iOS 프로덕션 배너 유닛. Android는 아직 프로덕션 유닛이 없어서 테스트 ID를 쓴다.
const IOS_BANNER = 'ca-app-pub-8143178103770527/9888622328';

export const BANNER_UNIT_ID: string | undefined = __DEV__
  ? TestIds.BANNER
  : Platform.select({ ios: IOS_BANNER, android: TestIds.BANNER });

export const initAds = async (): Promise<void> => {
  await mobileAds().initialize();
};
