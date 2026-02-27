/**
 * 3D Globe visualization using CesiumJS directly (no Resium).
 * Includes temperature data overlay from ERA5.
 */

import { useRef, useEffect, useState } from 'react';
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
import { announceToScreenReader, formatCoordinatesForScreenReader } from '../../utils/accessibility';

interface CesiumGlobeProps {
  onPointSelect: (lat: number, lon: number) => void;
}

interface ERA5Data {
  lats: number[];
  lons: number[];
  years: {
    [year: string]: {
      [month: string]: number[][];
    };
  };
}

// Color scale: blue (cold) -> cyan -> green -> yellow -> red (hot)
function temperatureToColor(tempK: number): [number, number, number] {
  const minTemp = 220;
  const maxTemp = 320;
  const normalized = Math.max(0, Math.min(1, (tempK - minTemp) / (maxTemp - minTemp)));

  let r: number, g: number, b: number;

  if (normalized < 0.25) {
    const t = normalized / 0.25;
    r = 0;
    g = Math.round(255 * t);
    b = 255;
  } else if (normalized < 0.5) {
    const t = (normalized - 0.25) / 0.25;
    r = 0;
    g = 255;
    b = Math.round(255 * (1 - t));
  } else if (normalized < 0.75) {
    const t = (normalized - 0.5) / 0.25;
    r = Math.round(255 * t);
    g = 255;
    b = 0;
  } else {
    const t = (normalized - 0.75) / 0.25;
    r = 255;
    g = Math.round(255 * (1 - t));
    b = 0;
  }

  return [r, g, b];
}

// Create temperature overlay canvas
// Rearranges data from 0-360 longitude to -180 to 180 for Cesium
function createTemperatureCanvas(
  era5Data: ERA5Data,
  year: number,
  month: number
): HTMLCanvasElement | null {
  const yearStr = String(year);
  const monthStr = String(month).padStart(2, '0');

  if (!era5Data.years[yearStr] || !era5Data.years[yearStr][monthStr]) {
    return null;
  }

  const grid = era5Data.years[yearStr][monthStr];
  const width = era5Data.lons.length;
  const height = era5Data.lats.length;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imageData = ctx.createImageData(width, height);

  // ERA5 lons are 0, 5, 10, ..., 355 (72 points at 5° spacing)
  // We need to rearrange so 180-355 comes first (becomes -180 to -5)
  // then 0-175 (stays as 0 to 175)
  // Find the split point: index where lon >= 180
  const splitIndex = era5Data.lons.findIndex(lon => lon >= 180);

  for (let latIdx = 0; latIdx < height; latIdx++) {
    for (let lonIdx = 0; lonIdx < width; lonIdx++) {
      // Remap longitude index:
      // Output 0 -> Input splitIndex (180°)
      // Output (width-splitIndex) -> Input 0 (0°)
      let srcLonIdx: number;
      if (lonIdx < width - splitIndex) {
        // First part of output: from 180° to 355° (indices splitIndex to end)
        srcLonIdx = splitIndex + lonIdx;
      } else {
        // Second part of output: from 0° to 175° (indices 0 to splitIndex-1)
        srcLonIdx = lonIdx - (width - splitIndex);
      }

      const temp = grid[latIdx][srcLonIdx];
      const [r, g, b] = temperatureToColor(temp);

      const pixelIdx = (latIdx * width + lonIdx) * 4;
      imageData.data[pixelIdx] = r;
      imageData.data[pixelIdx + 1] = g;
      imageData.data[pixelIdx + 2] = b;
      imageData.data[pixelIdx + 3] = temp ? 180 : 0; // Semi-transparent
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function CesiumGlobe({ onPointSelect }: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const entityRef = useRef<any>(null);
  const temperatureLayerRef = useRef<ImageryLayer | null>(null);
  const { selectedPoint, animation } = useMapStore();
  const [era5Data, setEra5Data] = useState<ERA5Data | null>(null);

  // Load ERA5 data
  useEffect(() => {
    fetch('/data/era5_t2m_sampled.json')
      .then((res) => res.json())
      .then((data) => setEra5Data(data))
      .catch((err) => console.error('Failed to load ERA5 data:', err));
  }, []);

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
      creditContainer: document.createElement('div'), // Hide credits
    });

    viewerRef.current = viewer;

    // Configure globe appearance
    viewer.scene.globe.baseColor = Color.fromCssColorString('#0f172a');
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.showGroundAtmosphere = true;

    // Add dark basemap
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(
      new UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        credit: 'CartoDB',
      })
    );

    // Set initial view
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(0, 20, 20000000),
    });

    // Disable default double-click zoom
    viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    // Cleanup on unmount
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Update temperature overlay when animation time or data changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !era5Data) return;

    // Get current year and month from animation
    const currentDate = new Date(animation.currentTime);
    const year = Math.max(2020, Math.min(2024, currentDate.getFullYear()));
    const month = currentDate.getMonth() + 1;

    // Create temperature canvas
    const canvas = createTemperatureCanvas(era5Data, year, month);
    if (!canvas) return;

    // Remove existing temperature layer
    if (temperatureLayerRef.current) {
      viewer.imageryLayers.remove(temperatureLayerRef.current);
      temperatureLayerRef.current = null;
    }

    // Create imagery provider from canvas
    const imageUrl = canvas.toDataURL();

    // ERA5 data rearranged to span -180 to 180, lats 90 to -90
    const rectangle = Rectangle.fromDegrees(-180, -90, 180, 90);

    const provider = new SingleTileImageryProvider({
      url: imageUrl,
      rectangle: rectangle,
    });

    // Add as imagery layer with transparency
    const layer = viewer.imageryLayers.addImageryProvider(provider);
    layer.alpha = 0.7;
    temperatureLayerRef.current = layer;

    return () => {
      if (temperatureLayerRef.current && viewer && !viewer.isDestroyed()) {
        viewer.imageryLayers.remove(temperatureLayerRef.current);
        temperatureLayerRef.current = null;
      }
    };
  }, [era5Data, animation.currentTime]);

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

    // Remove existing marker
    if (entityRef.current) {
      viewer.entities.remove(entityRef.current);
      entityRef.current = null;
    }

    // Add new marker if point selected
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

      {/* Coordinates display */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 panel px-3 py-2 text-sm z-[1000]">
          <span className="text-slate-400">Selected: </span>
          <span className="text-white font-mono">
            {selectedPoint.lat.toFixed(4)}°, {selectedPoint.lon.toFixed(4)}°
          </span>
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute top-4 left-4 panel px-3 py-2 z-[1000]">
        <div className="text-sm text-white font-medium">3D Globe View</div>
        <div className="text-xs text-slate-400">Drag to rotate, scroll to zoom</div>
      </div>

      {/* Keyboard instructions (screen reader) */}
      <div className="sr-only" aria-live="polite">
        Use mouse to rotate the globe. Click to select a location.
      </div>
    </div>
  );
}
