import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform, Share } from 'react-native';
import { COLORS } from '@/lib/config';
import type { Item } from '@/types';

export const openUrl = async (url: string): Promise<void> => {
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
  await Share.share({
    message: `${item.title}\n${item.url}\n\nvia Today Ad Trend`,
    url: item.url,
  });
};
