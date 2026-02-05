/**
 * Data state management with Zustand.
 */

import { create } from 'zustand';
import type { Dataset, GridData } from '../types/climate';
import type { ColormapConfig, ValueRange } from '../types/map';

interface DataState {
  // Available datasets
  datasets: Dataset[];
  selectedDatasetId: string | null;

  // Current data
  currentGrid: GridData | null;

  // Visualization settings
  colormap: ColormapConfig;
  valueRange: ValueRange;

  // Loading state
  loading: boolean;
  error: string | null;

  // Actions
  setDatasets: (datasets: Dataset[]) => void;
  selectDataset: (id: string) => void;
  setCurrentGrid: (grid: GridData | null) => void;
  setColormap: (colormap: ColormapConfig) => void;
  setValueRange: (range: Partial<ValueRange>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DEFAULT_COLORMAP: ColormapConfig = {
  id: 'rdbu',
  name: 'Red-Blue (Diverging)',
  type: 'diverging',
  colors: ['#2166ac', '#67a9cf', '#d1e5f0', '#f7f7f7', '#fddbc7', '#ef8a62', '#b2182b'],
  colorBlindSafe: true,
};

const DEFAULT_VALUE_RANGE: ValueRange = {
  min: 220,
  max: 320,
  autoScale: true,
};

export const useDataStore = create<DataState>((set) => ({
  datasets: [],
  selectedDatasetId: null,
  currentGrid: null,
  colormap: DEFAULT_COLORMAP,
  valueRange: DEFAULT_VALUE_RANGE,
  loading: false,
  error: null,

  setDatasets: (datasets) => set({ datasets }),

  selectDataset: (id) => set({ selectedDatasetId: id, currentGrid: null }),

  setCurrentGrid: (grid) => set({ currentGrid: grid }),

  setColormap: (colormap) => set({ colormap }),

  setValueRange: (range) =>
    set((state) => ({
      valueRange: { ...state.valueRange, ...range },
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));
