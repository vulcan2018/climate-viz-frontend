/**
 * UI state management with Zustand.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarTab: 'layers' | 'data' | 'analysis';

  // Preferences
  theme: 'dark' | 'light';
  showLabels: boolean;
  showGrid: boolean;
  reduceMotion: boolean;
  highContrast: boolean;

  // Temperature layer
  showTemperature: boolean;
  temperatureOpacity: number;

  // Actions
  toggleSidebar: () => void;
  setSidebarTab: (tab: 'layers' | 'data' | 'analysis') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setShowLabels: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setReduceMotion: (reduce: boolean) => void;
  setHighContrast: (high: boolean) => void;
  setShowTemperature: (show: boolean) => void;
  setTemperatureOpacity: (opacity: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarTab: 'layers',
      theme: 'dark',
      showLabels: true,
      showGrid: false,
      reduceMotion: false,
      highContrast: false,
      showTemperature: true,
      temperatureOpacity: 0.7,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarTab: (tab) => set({ sidebarTab: tab }),

      setTheme: (theme) => set({ theme }),

      setShowLabels: (show) => set({ showLabels: show }),

      setShowGrid: (show) => set({ showGrid: show }),

      setReduceMotion: (reduce) => set({ reduceMotion: reduce }),

      setHighContrast: (high) => set({ highContrast: high }),

      setShowTemperature: (show) => set({ showTemperature: show }),

      setTemperatureOpacity: (opacity) => set({ temperatureOpacity: opacity }),
    }),
    {
      name: 'climate-viz-ui',
      partialize: (state) => ({
        theme: state.theme,
        showLabels: state.showLabels,
        showGrid: state.showGrid,
        reduceMotion: state.reduceMotion,
        highContrast: state.highContrast,
        showTemperature: state.showTemperature,
        temperatureOpacity: state.temperatureOpacity,
      }),
    }
  )
);
