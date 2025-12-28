import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UIState {
  isDarkMode: boolean;
  language: 'ko' | 'en';
  toggleDarkMode: () => void;
  setLanguage: (lang: 'ko' | 'en') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      language: 'ko',
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
