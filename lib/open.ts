import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform, Share } from 'react-native';
import { COLORS } from '@/lib/config';
import type { Item } from '@/types';

// 원격 JSON의 링크는 서드파티 RSS에서 온다. javascript:, 다른 앱 스킴 등은 절대 열지 않는다.
export const isSafeWebUrl = (url: string): boolean => {
  try {
    const { protocol } = new URL(url);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
};

export const openUrl = async (url: string): Promise<void> => {
  if (!isSafeWebUrl(url)) return;
  if (Platform.OS === 'web') {
    await Linking.openURL(url);
    return;
  }
  await WebBrowser.openBrowserAsync(url, {
    controlsColor: COLORS.signal,
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  });
};

export const shareItem = async (item: Item): Promise<void> => {
  const safeUrl = isSafeWebUrl(item.url) ? item.url : undefined;
  await Share.share({
    message: safeUrl ? `${item.title}\n${safeUrl}\n\nvia Today Ad Trend` : `${item.title}\n\nvia Today Ad Trend`,
    url: safeUrl,
  });
};
