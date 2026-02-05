/**
 * Map and visualization type definitions.
 */

export type ProjectionType = 'mercator' | 'equirectangular' | 'orthographic' | 'polar-north' | 'polar-south';

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface LayerConfig {
  id: string;
  name: string;
  type: 'raster' | 'vector' | 'heatmap';
  visible: boolean;
  opacity: number;
  zIndex: number;
}

export interface ColormapConfig {
  id: string;
  name: string;
  type: 'sequential' | 'diverging' | 'categorical';
  colors: string[];
  colorBlindSafe: boolean;
}

export interface ValueRange {
  min: number;
  max: number;
  autoScale: boolean;
}

export interface AnimationState {
  playing: boolean;
  currentTime: string;
  startTime: string;
  endTime: string;
  speed: number; // frames per second
}

export interface AOIPolygon {
  id: string;
  coordinates: [number, number][];
  name?: string;
}

export interface MapClickEvent {
  lat: number;
  lon: number;
  value?: number;
  pixel?: [number, number];
}
