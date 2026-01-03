import { useRef, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

export function useScreenshot() {
  const viewRef = useRef<any>(null);

  const saveToGallery = useCallback(async () => {
    if (!viewRef.current) {
      Alert.alert('Error', 'Unable to capture screenshot');
      return false;
    }

    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to save screenshots.'
        );
        return false;
      }

      // Capture the view
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(uri);

      // Optionally create an album
      const albumName = 'TAT';
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Alert.alert('Saved!', 'Screenshot saved to your gallery.');
      return true;
    } catch (error) {
      console.error('Screenshot error:', error);
      Alert.alert('Error', 'Failed to save screenshot.');
      return false;
    }
  }, []);

  return {
    viewRef,
    saveToGallery,
  };
}
