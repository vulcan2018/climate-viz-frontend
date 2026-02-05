/**
 * Map state management with Zustand.
 */

import { create } from 'zustand';
import type { GeoPoint, BoundingBox } from '../types/climate';
import type { ViewState, ProjectionType, AnimationState, AOIPolygon } from '../types/map';

interface MapState {
  // View state
  viewState: ViewState;
  projection: ProjectionType;

  // Selection
  selectedPoint: GeoPoint | null;
  aoi: AOIPolygon | null;

  // Animation
  animation: AnimationState;

  // Actions
  setViewState: (viewState: Partial<ViewState>) => void;
  setProjection: (projection: ProjectionType) => void;
  setSelectedPoint: (point: GeoPoint | null) => void;
  setAOI: (aoi: AOIPolygon | null) => void;
  setAnimationState: (state: Partial<AnimationState>) => void;
  play: () => void;
  pause: () => void;
  setCurrentTime: (time: string) => void;
  zoomToBounds: (bounds: BoundingBox) => void;
}

const DEFAULT_VIEW_STATE: ViewState = {
  longitude: 0,
  latitude: 20,
  zoom: 2,
  pitch: 0,
  bearing: 0,
};

const DEFAULT_ANIMATION: AnimationState = {
  playing: false,
  currentTime: '2024-01-01',
  startTime: '2020-01-01',
  endTime: '2024-12-31',
  speed: 2,
};

export const useMapStore = create<MapState>((set) => ({
  viewState: DEFAULT_VIEW_STATE,
  projection: 'mercator',
  selectedPoint: null,
  aoi: null,
  animation: DEFAULT_ANIMATION,

  setViewState: (viewState) =>
    set((state) => ({
      viewState: { ...state.viewState, ...viewState },
    })),

  setProjection: (projection) => set({ projection }),

  setSelectedPoint: (point) => set({ selectedPoint: point }),

  setAOI: (aoi) => set({ aoi }),

  setAnimationState: (animState) =>
    set((state) => ({
      animation: { ...state.animation, ...animState },
    })),

  play: () =>
    set((state) => ({
      animation: { ...state.animation, playing: true },
    })),

  pause: () =>
    set((state) => ({
      animation: { ...state.animation, playing: false },
    })),

  setCurrentTime: (time) =>
    set((state) => ({
      animation: { ...state.animation, currentTime: time },
    })),

  zoomToBounds: (bounds) =>
    set({
      viewState: {
        longitude: (bounds.west + bounds.east) / 2,
        latitude: (bounds.south + bounds.north) / 2,
        zoom: 4,
        pitch: 0,
        bearing: 0,
      },
    }),
}));
