import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { recordActivity, type Streak } from '@/lib/streak';
import { normalizeKeyword } from '@/lib/watchlist';
import type { Item, Role } from '@/types';

export interface BriefTime {
  hour: number;
  minute: number;
}

export interface SavedItem extends Item {
  savedAt: string;
}

interface PrefsState {
  onboarded: boolean;
  role: Role;
  briefTime: BriefTime;
  remindersEnabled: boolean;
  // 에디션 날짜별로 읽은 아이템 id
  readByEdition: Record<string, string[]>;
  streak: Streak;
  saved: SavedItem[];
  watchlist: string[];

  completeOnboarding: () => void;
  setRole: (role: Role) => void;
  setBriefTime: (time: BriefTime) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  markRead: (editionDate: string, itemId: string) => void;
  toggleSaved: (item: Item) => void;
  addWatch: (keyword: string) => boolean;
  removeWatch: (keyword: string) => void;
}

const MAX_SAVED = 300;
const MAX_WATCH = 30;
const KEEP_EDITIONS = 14;

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      role: 'performance',
      briefTime: { hour: 8, minute: 0 },
      remindersEnabled: false,
      readByEdition: {},
      streak: { count: 0, lastDate: null },
      saved: [],
      watchlist: [],

      completeOnboarding: () => set({ onboarded: true }),
      setRole: (role) => set({ role }),
      setBriefTime: (briefTime) => set({ briefTime }),
      setRemindersEnabled: (remindersEnabled) => set({ remindersEnabled }),

      markRead: (editionDate, itemId) => {
        const { readByEdition, streak } = get();
        const current = readByEdition[editionDate] ?? [];
        if (current.includes(itemId)) return;
        const next = { ...readByEdition, [editionDate]: [...current, itemId] };
        // 오래된 에디션 기록은 정리해서 저장소가 무한히 커지지 않게 한다
        const keys = Object.keys(next).sort().reverse();
        for (const k of keys.slice(KEEP_EDITIONS)) delete next[k];
        set({ readByEdition: next, streak: recordActivity(streak) });
      },

      toggleSaved: (item) => {
        const { saved } = get();
        if (saved.some((s) => s.id === item.id)) {
          set({ saved: saved.filter((s) => s.id !== item.id) });
        } else {
          set({ saved: [{ ...item, savedAt: new Date().toISOString() }, ...saved].slice(0, MAX_SAVED) });
        }
      },

      addWatch: (raw) => {
        const keyword = normalizeKeyword(raw);
        const { watchlist } = get();
        if (!keyword || watchlist.length >= MAX_WATCH) return false;
        if (watchlist.some((w) => w.toLowerCase() === keyword.toLowerCase())) return false;
        set({ watchlist: [...watchlist, keyword] });
        return true;
      },
      removeWatch: (keyword) => set({ watchlist: get().watchlist.filter((w) => w !== keyword) }),
    }),
    {
      name: 'tat-prefs',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ onboarded, role, briefTime, remindersEnabled, readByEdition, streak, saved, watchlist }) => ({
        onboarded,
        role,
        briefTime,
        remindersEnabled,
        readByEdition,
        streak,
        saved,
        watchlist,
      }),
    }
  )
);

export const useIsSaved = (id: string) => usePrefs((s) => s.saved.some((item) => item.id === id));
