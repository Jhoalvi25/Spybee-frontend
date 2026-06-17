import { useUIStore } from './store';
import type { Theme } from './types';

export function useTheme(): Theme {
  return useUIStore((s) => s.theme);
}

export function useToggleTheme(): () => void {
  return useUIStore((s) => s.toggleTheme);
}

export function useSetTheme(): (t: Theme) => void {
  return useUIStore((s) => s.setTheme);
}

export { useUIStore };
