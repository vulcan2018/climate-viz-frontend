/**
 * 2D Map visualization using Deck.gl.
 */

import { useCallback, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MapView } from '@deck.gl/core';
import { useMapStore } from '../../stores/mapStore';
import { useDataStore } from '../../stores/dataStore';
import { MapProjection } from './MapProjection';
import { LayerControls } from './LayerControls';
import { createColorScale, valueToRGBA } from '../../utils/colormaps';
import { announceToScreenReader, formatCoordinatesForScreenReader } from '../../utils/accessibility';
import type { PickingInfo } from '@deck.gl/core';

interface DeckGLMapProps {
  onPointSelect: (lat: number, lon: number) => void;
}

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
  pitch: 0,
  bearing: 0,
};

export function DeckGLMap({ onPointSelect }: DeckGLMapProps) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const { selectedPoint } = useMapStore();
  const { currentGrid, colormap, valueRange } = useDataStore();

  // Handle map click
  const handleClick = useCallback(
    (info: PickingInfo) => {
      if (info.coordinate) {
        const [lon, lat] = info.coordinate;
        onPointSelect(lat, lon);
        announceToScreenReader(
          `Selected point at ${formatCoordinatesForScreenReader(lat, lon)}`
        );
      }
    },
    [onPointSelect]
  );

  // Create color scale
  const colorScale = useMemo(
    () => createColorScale(colormap, valueRange.min, valueRange.max),
    [colormap, valueRange]
  );

  // Create layers
  const layers = useMemo(() => {
    const layersList = [];

    // Grid data layer (if available)
    if (currentGrid) {
      // Convert grid to GeoJSON features for rendering
      const features = [];
      for (let i = 0; i < currentGrid.lats.length; i++) {
        for (let j = 0; j < currentGrid.lons.length; j++) {
          const value = currentGrid.values[i][j];
          if (value !== null && value !== undefined) {
            features.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [currentGrid.lons[j], currentGrid.lats[i]],
              },
              properties: { value },
            });
          }
        }
      }

      layersList.push(
        new GeoJsonLayer({
          id: 'grid-layer',
          data: { type: 'FeatureCollection', features },
          pointType: 'circle',
          getPointRadius: 50000,
          getFillColor: (d: { properties: { value: number } }) =>
            valueToRGBA(d.properties.value, colorScale, 200),
          pickable: true,
        })
      );
    }

    // Selected point marker
    if (selectedPoint) {
      layersList.push(
        new GeoJsonLayer({
          id: 'selected-point',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [selectedPoint.lon, selectedPoint.lat],
                },
                properties: {},
              },
            ],
          },
          pointType: 'circle',
          getPointRadius: 8,
          getFillColor: [59, 130, 246, 255], // blue-500
          getLineColor: [255, 255, 255, 255],
          getLineWidth: 2,
          stroked: true,
        })
      );
    }

    return layersList;
  }, [currentGrid, selectedPoint, colorScale]);

  // Get tooltip content
  const getTooltip = useCallback(
    (info: PickingInfo) => {
      if (!info.object) return null;

      const { properties } = info.object as { properties: { value?: number } };
      if (properties?.value !== undefined) {
        return {
          html: `<div class="p-2 bg-slate-800 rounded shadow">
            <div class="text-white font-medium">${properties.value.toFixed(1)} K</div>
            <div class="text-slate-400 text-sm">${(properties.value - 273.15).toFixed(1)} °C</div>
          </div>`,
        };
      }

      return null;
    },
    []
  );

  return (
    <div className="w-full h-full relative" role="application" aria-label="2D Map visualization">
      <DeckGL
        viewState={viewState}
        onViewStateChange={(params: { viewState: typeof viewState }) => setViewState(params.viewState)}
        controller={true}
        layers={layers}
        onClick={handleClick}
        getTooltip={getTooltip}
        views={new MapView({ repeat: true })}
      >
        {/* Dark base map tiles */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: '#0f172a',
          }}
        >
          <img
            src="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/2/2/2.png"
            alt=""
            style={{ display: 'none' }}
            onLoad={() => {
              // Trigger map tile loading
            }}
          />
        </div>
      </DeckGL>

      {/* Projection selector */}
      <div className="absolute top-4 left-4">
        <MapProjection />
      </div>

      {/* Layer controls */}
      <div className="absolute bottom-20 right-4">
        <LayerControls />
      </div>

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
        Use arrow keys to pan the map. Press Enter or Space to select a location.
        Use + and - keys to zoom in and out.
      </div>
    </div>
  );
}
