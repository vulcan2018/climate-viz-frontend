/**
 * Temperature overlay layer using canvas rendering.
 */

import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../../stores/mapStore';

interface ERA5Data {
  lats: number[];
  lons: number[];
  years: {
    [year: string]: {
      [month: string]: number[][];
    };
  };
}

interface TemperatureLayerProps {
  opacity: number;
  visible: boolean;
}

// Color scale: blue (cold) -> white -> red (hot)
function temperatureToColor(tempK: number): [number, number, number] {
  // Range: 220K (-53°C) to 320K (47°C)
  const minTemp = 220;
  const maxTemp = 320;
  const normalized = Math.max(0, Math.min(1, (tempK - minTemp) / (maxTemp - minTemp)));

  // Blue -> Cyan -> Green -> Yellow -> Red
  let r: number, g: number, b: number;

  if (normalized < 0.25) {
    // Blue to Cyan
    const t = normalized / 0.25;
    r = 0;
    g = Math.round(255 * t);
    b = 255;
  } else if (normalized < 0.5) {
    // Cyan to Green
    const t = (normalized - 0.25) / 0.25;
    r = 0;
    g = 255;
    b = Math.round(255 * (1 - t));
  } else if (normalized < 0.75) {
    // Green to Yellow
    const t = (normalized - 0.5) / 0.25;
    r = Math.round(255 * t);
    g = 255;
    b = 0;
  } else {
    // Yellow to Red
    const t = (normalized - 0.75) / 0.25;
    r = 255;
    g = Math.round(255 * (1 - t));
    b = 0;
  }

  return [r, g, b];
}

export function TemperatureLayer({ opacity, visible }: TemperatureLayerProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);
  const [era5Data, setEra5Data] = useState<ERA5Data | null>(null);
  const { animation } = useMapStore();

  // Load ERA5 data
  useEffect(() => {
    fetch('/data/era5_t2m_sampled.json')
      .then((res) => res.json())
      .then((data) => setEra5Data(data))
      .catch((err) => console.error('Failed to load ERA5 data:', err));
  }, []);

  // Get current year and month from animation
  const currentDate = new Date(animation.currentTime);
  const year = Math.max(2020, Math.min(2024, currentDate.getFullYear()));
  const month = currentDate.getMonth() + 1;

  // Render temperature overlay
  useEffect(() => {
    if (!era5Data || !visible) {
      // Remove overlay if not visible
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
      return;
    }

    const yearStr = String(year);
    const monthStr = String(month).padStart(2, '0');

    if (!era5Data.years[yearStr] || !era5Data.years[yearStr][monthStr]) {
      return;
    }

    const grid = era5Data.years[yearStr][monthStr];
    const lats = era5Data.lats;
    const lons = era5Data.lons;

    // Create canvas
    const canvas = document.createElement('canvas');
    const width = lons.length;
    const height = lats.length;
    canvas.width = width;
    canvas.height = height;
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find the index where longitude crosses 180 (to rearrange for -180 to 180)
    // ERA5 lons are 0, 5, 10, ..., 355. We need to rearrange so it goes -180 to 180
    // Lons > 180 become negative (e.g., 185 -> -175, 355 -> -5)
    const splitIdx = lons.findIndex((lon) => lon > 180); // First lon > 180

    // Draw temperature data with longitude rearrangement
    const imageData = ctx.createImageData(width, height);

    for (let latIdx = 0; latIdx < height; latIdx++) {
      for (let newLonIdx = 0; newLonIdx < width; newLonIdx++) {
        // Map new pixel position to original data index
        // New order: [splitIdx, splitIdx+1, ..., width-1, 0, 1, ..., splitIdx-1]
        let origLonIdx: number;
        if (newLonIdx < width - splitIdx) {
          origLonIdx = splitIdx + newLonIdx;
        } else {
          origLonIdx = newLonIdx - (width - splitIdx);
        }

        const temp = grid[latIdx][origLonIdx];
        const [r, g, b] = temperatureToColor(temp);

        const pixelIdx = (latIdx * width + newLonIdx) * 4;
        imageData.data[pixelIdx] = r;
        imageData.data[pixelIdx + 1] = g;
        imageData.data[pixelIdx + 2] = b;
        imageData.data[pixelIdx + 3] = temp ? 200 : 0; // Alpha (transparent if no data)
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Create image URL
    const imageUrl = canvas.toDataURL();

    // Calculate bounds for -180 to 180 range
    // After rearrangement: first pixel is lon[splitIdx]-360, last is lon[splitIdx-1]
    const westLon = lons[splitIdx] - 360; // e.g., 185 - 360 = -175
    const eastLon = lons[splitIdx - 1];   // e.g., 180
    const bounds: L.LatLngBoundsExpression = [
      [lats[lats.length - 1], westLon], // SW corner
      [lats[0], eastLon], // NE corner
    ];

    // Remove old overlay
    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
    }

    // Add new overlay
    const overlay = L.imageOverlay(imageUrl, bounds, {
      opacity: opacity,
      interactive: false,
    });

    overlay.addTo(map);
    overlayRef.current = overlay;

    return () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [era5Data, map, year, month, opacity, visible]);

  // Update opacity when it changes
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  return null; // This component renders via Leaflet, not React DOM
}
