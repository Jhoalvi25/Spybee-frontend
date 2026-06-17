import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from './types';

type UIState = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'spybee-ui' }
  )
);
