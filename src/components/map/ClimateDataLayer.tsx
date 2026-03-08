/**
 * Climate data overlay layer for 2D map - responds to dataset selection.
 */

import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../../stores/mapStore';
import { useDataStore } from '../../stores/dataStore';

interface ClimateData {
  lats: number[];
  lons: number[];
  years: {
    [year: string]: {
      [month: string]: number[][];
    };
  };
}

interface ClimateDataLayerProps {
  opacity: number;
  visible: boolean;
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
    maxValue: 0.02,
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
    if (normalized < 0.25) {
      const t = normalized / 0.25;
      r = Math.round(255 * (1 - t * 0.3));
      g = Math.round(255 * (1 - t * 0.1));
      b = 255;
    } else if (normalized < 0.5) {
      const t = (normalized - 0.25) / 0.25;
      r = Math.round(178 * (1 - t));
      g = Math.round(230 * (1 - t * 0.5));
      b = 255;
    } else if (normalized < 0.75) {
      const t = (normalized - 0.5) / 0.25;
      r = Math.round(0 + t * 75);
      g = Math.round(115 * (1 - t));
      b = Math.round(255 * (1 - t * 0.3));
    } else {
      const t = (normalized - 0.75) / 0.25;
      r = Math.round(75 + t * 65);
      g = 0;
      b = Math.round(178 + t * 40);
    }
  } else {
    // Ozone
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

export function ClimateDataLayer({ opacity, visible }: ClimateDataLayerProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlaysRef = useRef<L.ImageOverlay[]>([]);
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [loadedDataset, setLoadedDataset] = useState<string | null>(null);
  const { animation } = useMapStore();
  const { selectedDatasetId } = useDataStore();

  // Get current config
  const config = DATASET_CONFIG[selectedDatasetId || 'era5-t2m'] || DATASET_CONFIG['era5-t2m'];

  // Load data when dataset changes
  useEffect(() => {
    const datasetId = selectedDatasetId || 'era5-t2m';
    const dataConfig = DATASET_CONFIG[datasetId];

    if (!dataConfig) {
      console.warn(`No config for dataset: ${datasetId}`);
      return;
    }

    // Don't reload if same dataset
    if (loadedDataset === datasetId && climateData) return;

    console.log(`2D: Loading dataset: ${datasetId}`);
    setClimateData(null);

    fetch(dataConfig.file)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log(`2D: Loaded ${datasetId}`);
        setClimateData(data);
        setLoadedDataset(datasetId);
      })
      .catch((err) => {
        console.error(`Failed to load ${datasetId}:`, err);
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

  // Get current year and month
  const currentDate = new Date(animation.currentTime);
  const year = Math.max(2020, Math.min(2024, currentDate.getFullYear()));
  const month = currentDate.getMonth() + 1;

  // Render climate overlay
  useEffect(() => {
    if (!climateData || !visible) {
      overlaysRef.current.forEach((overlay) => map.removeLayer(overlay));
      overlaysRef.current = [];
      return;
    }

    const yearStr = String(year);
    const monthStr = String(month).padStart(2, '0');

    if (!climateData.years[yearStr] || !climateData.years[yearStr][monthStr]) {
      return;
    }

    const grid = climateData.years[yearStr][monthStr];
    const lats = climateData.lats;
    const lons = climateData.lons;

    const canvas = document.createElement('canvas');
    const width = lons.length;
    const height = lats.length;
    canvas.width = width;
    canvas.height = height;
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);

    for (let latIdx = 0; latIdx < height; latIdx++) {
      for (let lonIdx = 0; lonIdx < width; lonIdx++) {
        const value = grid[latIdx][lonIdx];
        const [r, g, b] = valueToColor(value, config.minValue, config.maxValue, config.colorScale);

        const pixelIdx = (latIdx * width + lonIdx) * 4;
        imageData.data[pixelIdx] = r;
        imageData.data[pixelIdx + 1] = g;
        imageData.data[pixelIdx + 2] = b;
        imageData.data[pixelIdx + 3] = value ? 200 : 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const imageUrl = canvas.toDataURL();

    // Remove old overlays
    overlaysRef.current.forEach((overlay) => map.removeLayer(overlay));
    overlaysRef.current = [];

    // Calculate bounds
    const latSouth = lats[lats.length - 1] + 10;
    const latNorth = lats[0] + 10;
    const lonWest = lons[0] - 3;
    const lonEast = lons[lons.length - 1] + 5 - 3;

    // Add overlays with world wrapping
    const worldOffsets = [-360, 0, 360];

    worldOffsets.forEach((offset) => {
      const bounds: L.LatLngBoundsExpression = [
        [latSouth, lonWest + offset],
        [latNorth, lonEast + offset],
      ];

      const overlay = L.imageOverlay(imageUrl, bounds, {
        opacity: opacity,
        interactive: false,
      });

      overlay.addTo(map);
      overlaysRef.current.push(overlay);
    });

    return () => {
      overlaysRef.current.forEach((overlay) => map.removeLayer(overlay));
      overlaysRef.current = [];
    };
  }, [climateData, map, year, month, opacity, visible, config, selectedDatasetId]);

  // Update opacity
  useEffect(() => {
    overlaysRef.current.forEach((overlay) => {
      overlay.setOpacity(opacity);
    });
  }, [opacity]);

  return null;
}
