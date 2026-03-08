/**
 * 3D Globe visualization using CesiumJS with climate data overlay.
 * Supports dataset switching (temperature, precipitation, ozone).
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Viewer,
  Cartesian2,
  Cartesian3,
  ScreenSpaceEventType,
  UrlTemplateImageryProvider,
  SingleTileImageryProvider,
  Math as CesiumMath,
  Color,
  ScreenSpaceEventHandler,
  Rectangle,
  ImageryLayer,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useMapStore } from '../../stores/mapStore';
import { useDataStore } from '../../stores/dataStore';
import { useUIStore } from '../../stores/uiStore';
import { announceToScreenReader, formatCoordinatesForScreenReader } from '../../utils/accessibility';

interface CesiumGlobeProps {
  onPointSelect: (lat: number, lon: number) => void;
}

interface ClimateData {
  lats: number[];
  lons: number[];
  years: {
    [year: string]: {
      [month: string]: number[][];
    };
  };
}

// Dataset configurations
const DATASET_CONFIG: Record<string, {
  file: string;
  minValue: number;
  maxValue: number;
  colorScale: 'temperature' | 'precipitation' | 'ozone';
}> = {
  'era5-t2m': {
    file: '/data/era5_t2m_sampled.json',
    minValue: 220,
    maxValue: 320,
    colorScale: 'temperature',
  },
  'era5-precip': {
    file: '/data/era5_tp_sampled.json',
    minValue: 0,
    maxValue: 0.015,
    colorScale: 'precipitation',
  },
  'cams-ozone': {
    file: '/data/cams_ozone_sampled.json',
    minValue: 200,
    maxValue: 500,
    colorScale: 'ozone',
  },
};

// Color scales for different variables
function valueToColor(
  value: number,
  minValue: number,
  maxValue: number,
  colorScale: 'temperature' | 'precipitation' | 'ozone'
): [number, number, number] {
  const normalized = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue)));

  let r: number, g: number, b: number;

  if (colorScale === 'temperature') {
    // Blue -> Cyan -> Green -> Yellow -> Red
    if (normalized < 0.25) {
      const t = normalized / 0.25;
      r = 0; g = Math.round(255 * t); b = 255;
    } else if (normalized < 0.5) {
      const t = (normalized - 0.25) / 0.25;
      r = 0; g = 255; b = Math.round(255 * (1 - t));
    } else if (normalized < 0.75) {
      const t = (normalized - 0.5) / 0.25;
      r = Math.round(255 * t); g = 255; b = 0;
    } else {
      const t = (normalized - 0.75) / 0.25;
      r = 255; g = Math.round(255 * (1 - t)); b = 0;
    }
  } else if (colorScale === 'precipitation') {
    // Light cyan -> Blue -> Dark blue -> Purple (more vivid)
    if (normalized < 0.33) {
      const t = normalized / 0.33;
      r = Math.round(200 * (1 - t));
      g = Math.round(255 * (1 - t * 0.3));
      b = 255;
    } else if (normalized < 0.66) {
      const t = (normalized - 0.33) / 0.33;
      r = 0;
      g = Math.round(180 * (1 - t));
      b = 255;
    } else {
      const t = (normalized - 0.66) / 0.34;
      r = Math.round(100 * t);
      g = 0;
      b = Math.round(255 - t * 55);
    }
  } else {
    // Ozone: Purple -> Blue -> Cyan -> Green -> Yellow
    if (normalized < 0.25) {
      const t = normalized / 0.25;
      r = Math.round(128 * (1 - t));
      g = 0;
      b = Math.round(128 + t * 127);
    } else if (normalized < 0.5) {
      const t = (normalized - 0.25) / 0.25;
      r = 0;
      g = Math.round(255 * t);
      b = 255;
    } else if (normalized < 0.75) {
      const t = (normalized - 0.5) / 0.25;
      r = 0;
      g = 255;
      b = Math.round(255 * (1 - t));
    } else {
      const t = (normalized - 0.75) / 0.25;
      r = Math.round(255 * t);
      g = 255;
      b = 0;
    }
  }

  return [r, g, b];
}

// Create climate overlay canvas with longitude rearrangement for Cesium
function createClimateCanvas(
  climateData: ClimateData,
  year: number,
  month: number,
  config: { minValue: number; maxValue: number; colorScale: 'temperature' | 'precipitation' | 'ozone' }
): HTMLCanvasElement | null {
  const yearStr = String(year);
  const monthStr = String(month).padStart(2, '0');

  if (!climateData.years[yearStr] || !climateData.years[yearStr][monthStr]) {
    return null;
  }

  const grid = climateData.years[yearStr][monthStr];
  const width = climateData.lons.length;
  const height = climateData.lats.length;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imageData = ctx.createImageData(width, height);

  // Rearrange longitude: 0-360 to -180 to 180
  const splitIndex = climateData.lons.findIndex(lon => lon >= 180);

  for (let latIdx = 0; latIdx < height; latIdx++) {
    for (let lonIdx = 0; lonIdx < width; lonIdx++) {
      let srcLonIdx: number;
      if (lonIdx < width - splitIndex) {
        srcLonIdx = splitIndex + lonIdx;
      } else {
        srcLonIdx = lonIdx - (width - splitIndex);
      }

      const value = grid[latIdx][srcLonIdx];
      const [r, g, b] = valueToColor(value, config.minValue, config.maxValue, config.colorScale);

      const pixelIdx = (latIdx * width + lonIdx) * 4;
      imageData.data[pixelIdx] = r;
      imageData.data[pixelIdx + 1] = g;
      imageData.data[pixelIdx + 2] = b;
      imageData.data[pixelIdx + 3] = 180; // Always show overlay
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function CesiumGlobe({ onPointSelect }: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const entityRef = useRef<any>(null);
  const climateLayerRef = useRef<ImageryLayer | null>(null);
  const { selectedPoint, animation } = useMapStore();
  const { selectedDatasetId } = useDataStore();
  const { showTemperature, temperatureOpacity } = useUIStore();
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [loadedDataset, setLoadedDataset] = useState<string | null>(null);

  // Get config for current dataset
  const config = DATASET_CONFIG[selectedDatasetId || 'era5-t2m'] || DATASET_CONFIG['era5-t2m'];

  // Load climate data when dataset changes
  useEffect(() => {
    const datasetId = selectedDatasetId || 'era5-t2m';
    const dataConfig = DATASET_CONFIG[datasetId];

    if (!dataConfig) {
      console.warn(`No config for dataset: ${datasetId}`);
      return;
    }

    // Skip if already loaded
    if (loadedDataset === datasetId && climateData) return;

    console.log(`Loading dataset: ${datasetId} from ${dataConfig.file}`);
    setClimateData(null); // Clear while loading

    fetch(dataConfig.file)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log(`Loaded ${datasetId} data`);
        setClimateData(data);
        setLoadedDataset(datasetId);
      })
      .catch((err) => {
        console.error(`Failed to load ${datasetId}:`, err);
        // Fallback to temperature
        if (datasetId !== 'era5-t2m') {
          fetch('/data/era5_t2m_sampled.json')
            .then((res) => res.json())
            .then((data) => {
              setClimateData(data);
              setLoadedDataset('era5-t2m');
            });
        }
      });
  }, [selectedDatasetId, loadedDataset, climateData]);

  // Initialize Cesium viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      creditContainer: document.createElement('div'),
    });

    viewerRef.current = viewer;

    viewer.scene.globe.baseColor = Color.fromCssColorString('#0f172a');
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.showGroundAtmosphere = true;

    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(
      new UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        credit: 'CartoDB',
      })
    );

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(0, 20, 20000000),
    });

    viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Update climate overlay when data, dataset, or time changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !climateData || !showTemperature) {
      // Remove layer if not showing
      if (climateLayerRef.current && viewer && !viewer.isDestroyed()) {
        viewer.imageryLayers.remove(climateLayerRef.current);
        climateLayerRef.current = null;
      }
      return;
    }

    const currentDate = new Date(animation.currentTime);
    const year = Math.max(2020, Math.min(2024, currentDate.getFullYear()));
    const month = currentDate.getMonth() + 1;

    const canvas = createClimateCanvas(climateData, year, month, config);
    if (!canvas) return;

    // Remove existing layer
    if (climateLayerRef.current) {
      viewer.imageryLayers.remove(climateLayerRef.current);
      climateLayerRef.current = null;
    }

    const imageUrl = canvas.toDataURL();
    const rectangle = Rectangle.fromDegrees(-180, -90, 180, 90);

    const provider = new SingleTileImageryProvider({
      url: imageUrl,
      rectangle: rectangle,
    });

    const layer = viewer.imageryLayers.addImageryProvider(provider);
    layer.alpha = temperatureOpacity;
    climateLayerRef.current = layer;

    return () => {
      if (climateLayerRef.current && viewer && !viewer.isDestroyed()) {
        viewer.imageryLayers.remove(climateLayerRef.current);
        climateLayerRef.current = null;
      }
    };
  }, [climateData, animation.currentTime, config, showTemperature, temperatureOpacity, selectedDatasetId]);

  // Set up click handler
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement: { position: Cartesian2 }) => {
      const cartesian = viewer.camera.pickEllipsoid(
        movement.position,
        viewer.scene.globe.ellipsoid
      );

      if (cartesian) {
        const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        const lat = CesiumMath.toDegrees(cartographic.latitude);
        const lon = CesiumMath.toDegrees(cartographic.longitude);

        onPointSelect(lat, lon);
        announceToScreenReader(
          `Selected point at ${formatCoordinatesForScreenReader(lat, lon)}`
        );
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [onPointSelect]);

  // Update marker when selected point changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (entityRef.current) {
      viewer.entities.remove(entityRef.current);
      entityRef.current = null;
    }

    if (selectedPoint) {
      entityRef.current = viewer.entities.add({
        position: Cartesian3.fromDegrees(selectedPoint.lon, selectedPoint.lat),
        point: {
          pixelSize: 12,
          color: Color.fromCssColorString('#3b82f6'),
          outlineColor: Color.WHITE,
          outlineWidth: 2,
        },
      });
    }
  }, [selectedPoint]);

  return (
    <div className="w-full h-full relative" role="application" aria-label="3D Globe visualization">
      <div ref={containerRef} className="w-full h-full" />

      {selectedPoint && (
        <div className="absolute bottom-4 left-4 panel px-3 py-2 text-sm z-[1000]">
          <span className="text-slate-400">Selected: </span>
          <span className="text-white font-mono">
            {selectedPoint.lat.toFixed(4)}°, {selectedPoint.lon.toFixed(4)}°
          </span>
        </div>
      )}

      <div className="absolute top-4 left-4 panel px-3 py-2 z-[1000]">
        <div className="text-sm text-white font-medium">3D Globe View</div>
        <div className="text-xs text-slate-400">Drag to rotate, scroll to zoom</div>
      </div>

      <div className="sr-only" aria-live="polite">
        Use mouse to rotate the globe. Click to select a location.
      </div>
    </div>
  );
}
