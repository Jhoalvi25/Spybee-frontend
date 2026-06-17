import { useUIStore } from './store';
import type { Theme, MapStyle } from './types';

export function useTheme(): Theme {
  return useUIStore((s) => s.theme);
}

export function useToggleTheme(): () => void {
  return useUIStore((s) => s.toggleTheme);
}

export function useSetTheme(): (t: Theme) => void {
  return useUIStore((s) => s.setTheme);
}

export function useMapStyle(): MapStyle {
  return useUIStore((s) => s.mapStyle);
}

export function useSetMapStyle(): (s: MapStyle) => void {
  return useUIStore((s) => s.setMapStyle);
}

export { useUIStore };
