import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_INTERSTITIAL_PER_HOUR = 3;
const APP_OPEN_BACKGROUND_THRESHOLD = 30000; // 30 seconds

interface AdState {
  interstitialCount: number;
  lastInterstitialTime: number | null;
  lastBackgroundTime: number | null;
  sessionAppOpenShown: boolean;
  adViewCount: number;

  incrementInterstitial: () => void;
  resetInterstitialCount: () => void;
  canShowInterstitial: () => boolean;

  setBackgroundTime: (time: number) => void;
  canShowAppOpen: () => boolean;
  markAppOpenShown: () => void;

  incrementAdView: () => void;
  shouldShowInterstitialAfterAdView: () => boolean;
}

export const useAdStore = create<AdState>()(
  persist(
    (set, get) => ({
      interstitialCount: 0,
      lastInterstitialTime: null,
      lastBackgroundTime: null,
      sessionAppOpenShown: false,
      adViewCount: 0,

      incrementInterstitial: () =>
        set((state) => ({
          interstitialCount: state.interstitialCount + 1,
          lastInterstitialTime: Date.now(),
        })),

      resetInterstitialCount: () =>
        set({ interstitialCount: 0 }),

      canShowInterstitial: () => {
        const state = get();
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;

        if (state.lastInterstitialTime && state.lastInterstitialTime > oneHourAgo) {
          return state.interstitialCount < MAX_INTERSTITIAL_PER_HOUR;
        }

        set({ interstitialCount: 0 });
        return true;
      },

      setBackgroundTime: (time: number) =>
        set({ lastBackgroundTime: time }),

      canShowAppOpen: () => {
        const state = get();
        if (state.sessionAppOpenShown) return false;
        if (!state.lastBackgroundTime) return false;

        const elapsed = Date.now() - state.lastBackgroundTime;
        return elapsed >= APP_OPEN_BACKGROUND_THRESHOLD;
      },

      markAppOpenShown: () =>
        set({ sessionAppOpenShown: true }),

      incrementAdView: () =>
        set((state) => ({ adViewCount: state.adViewCount + 1 })),

      shouldShowInterstitialAfterAdView: () => {
        const state = get();
        return state.adViewCount > 0 && state.adViewCount % 3 === 0;
      },
    }),
    {
      name: 'ad-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        interstitialCount: state.interstitialCount,
        lastInterstitialTime: state.lastInterstitialTime,
      }),
    }
  )
);
