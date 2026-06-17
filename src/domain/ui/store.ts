import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, MapStyle } from './types';

type UIState = {
  theme: Theme;
  mapStyle: MapStyle;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setMapStyle: (s: MapStyle) => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      mapStyle: 'light',
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (t) => set({ theme: t }),
      setMapStyle: (s) => set({ mapStyle: s }),
    }),
    { name: 'spybee-ui' }
  )
);
