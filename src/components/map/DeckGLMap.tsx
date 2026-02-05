/**
 * 2D Map visualization using Deck.gl.
 */

import { useCallback, useState, useMemo } from 'react';
import { useMapStore } from '../../stores/mapStore';
import { useDataStore } from '../../stores/dataStore';
import { MapProjection } from './MapProjection';
import { LayerControls } from './LayerControls';
import { createColorScale } from '../../utils/colormaps';
import { announceToScreenReader, formatCoordinatesForScreenReader } from '../../utils/accessibility';

interface DeckGLMapProps {
  onPointSelect: (lat: number, lon: number) => void;
}

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
};

export function DeckGLMap({ onPointSelect }: DeckGLMapProps) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const { selectedPoint } = useMapStore();
  const { currentGrid, colormap, valueRange } = useDataStore();

  // Create color scale
  const colorScale = useMemo(
    () => createColorScale(colormap, valueRange.min, valueRange.max),
    [colormap, valueRange]
  );

  // Handle map click
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Simple conversion from pixel to lat/lon (approximate)
      const lon = ((x / rect.width) * 360) - 180;
      const lat = 90 - ((y / rect.height) * 180);

      onPointSelect(lat, lon);
      announceToScreenReader(
        `Selected point at ${formatCoordinatesForScreenReader(lat, lon)}`
      );
    },
    [onPointSelect]
  );

  return (
    <div
      className="w-full h-full relative bg-slate-900 cursor-crosshair"
      role="application"
      aria-label="2D Map visualization"
      onClick={handleClick}
    >
      {/* Simple map background using tiles */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/1/0/0.png"
          alt=""
          className="absolute opacity-50"
          style={{ top: 0, left: 0, width: '50%', height: '50%' }}
        />
        <img
          src="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/1/1/0.png"
          alt=""
          className="absolute opacity-50"
          style={{ top: 0, left: '50%', width: '50%', height: '50%' }}
        />
        <img
          src="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/1/0/1.png"
          alt=""
          className="absolute opacity-50"
          style={{ top: '50%', left: 0, width: '50%', height: '50%' }}
        />
        <img
          src="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/1/1/1.png"
          alt=""
          className="absolute opacity-50"
          style={{ top: '50%', left: '50%', width: '50%', height: '50%' }}
        />
      </div>

      {/* Overlay info */}
      <div className="absolute top-4 left-4 panel px-3 py-2">
        <div className="text-sm text-white font-medium">2D Map View</div>
        <div className="text-xs text-slate-400">Click anywhere to select a point</div>
      </div>

      {/* Projection selector */}
      <div className="absolute top-20 left-4">
        <MapProjection />
      </div>

      {/* Layer controls */}
      <div className="absolute bottom-20 right-4">
        <LayerControls />
      </div>

      {/* Selected point marker */}
      {selectedPoint && (
        <div
          className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${((selectedPoint.lon + 180) / 360) * 100}%`,
            top: `${((90 - selectedPoint.lat) / 180) * 100}%`,
          }}
        />
      )}

      {/* Coordinates display */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 panel px-3 py-2 text-sm">
          <span className="text-slate-400">Selected: </span>
          <span className="text-white font-mono">
            {selectedPoint.lat.toFixed(4)}°, {selectedPoint.lon.toFixed(4)}°
          </span>
        </div>
      )}

      {/* Keyboard instructions (screen reader) */}
      <div className="sr-only" aria-live="polite">
        Click on the map to select a location.
      </div>
    </div>
  );
}
