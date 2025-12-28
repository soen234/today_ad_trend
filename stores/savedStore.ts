import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedState {
  savedAdIds: string[];
  saveAd: (adId: string) => void;
  unsaveAd: (adId: string) => void;
  toggleSaveAd: (adId: string) => void;
  isAdSaved: (adId: string) => boolean;
  clearAll: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedAdIds: [],

      saveAd: (adId) =>
        set((state) => {
          if (state.savedAdIds.includes(adId)) {
            return state;
          }
          return { savedAdIds: [...state.savedAdIds, adId] };
        }),

      unsaveAd: (adId) =>
        set((state) => ({
          savedAdIds: state.savedAdIds.filter((id) => id !== adId),
        })),

      toggleSaveAd: (adId) => {
        const { savedAdIds, saveAd, unsaveAd } = get();
        if (savedAdIds.includes(adId)) {
          unsaveAd(adId);
        } else {
          saveAd(adId);
        }
      },

      isAdSaved: (adId) => {
        return get().savedAdIds.includes(adId);
      },

      clearAll: () => set({ savedAdIds: [] }),
    }),
    {
      name: 'saved-ads-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
