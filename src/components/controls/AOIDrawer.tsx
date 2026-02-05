/**
 * Area of Interest (AOI) drawing tool.
 */

import { useState, useCallback } from 'react';
import { useMapStore } from '../../stores/mapStore';
import type { AOIPolygon } from '../../types/map';
import type { BoundingBox } from '../../types/climate';

interface AOIDrawerProps {
  onRegionSelect: (bbox: BoundingBox) => void;
}

export function AOIDrawer({ onRegionSelect }: AOIDrawerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'rectangle' | 'polygon'>('rectangle');
  const { aoi, setAOI } = useMapStore();

  const startDrawing = useCallback(() => {
    setIsDrawing(true);
    setAOI(null);
  }, [setAOI]);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setAOI(null);
  }, [setAOI]);

  const _completeDrawing = useCallback(
    (polygon: AOIPolygon) => {
      setIsDrawing(false);
      setAOI(polygon);

      // Calculate bounding box
      const lons = polygon.coordinates.map((c) => c[0]);
      const lats = polygon.coordinates.map((c) => c[1]);

      const bbox: BoundingBox = {
        west: Math.min(...lons),
        east: Math.max(...lons),
        south: Math.min(...lats),
        north: Math.max(...lats),
      };

      onRegionSelect(bbox);
    },
    [setAOI, onRegionSelect]
  );
  // TODO: Wire up _completeDrawing to map drawing interactions
  void _completeDrawing;

  const clearAOI = useCallback(() => {
    setAOI(null);
  }, [setAOI]);

  return (
    <div className="space-y-3">
      <label className="label">Area of Interest</label>

      {/* Draw mode selector */}
      <div className="flex rounded-lg bg-slate-800 p-1">
        <button
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            drawMode === 'rectangle'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => setDrawMode('rectangle')}
          aria-pressed={drawMode === 'rectangle'}
        >
          Rectangle
        </button>
        <button
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            drawMode === 'polygon'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => setDrawMode('polygon')}
          aria-pressed={drawMode === 'polygon'}
        >
          Polygon
        </button>
      </div>

      {/* Drawing controls */}
      {!isDrawing ? (
        <button
          className="w-full btn btn-primary text-sm"
          onClick={startDrawing}
        >
          <svg
            className="w-4 h-4 mr-2 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Draw Region
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            {drawMode === 'rectangle'
              ? 'Click and drag to draw a rectangle'
              : 'Click to add points, double-click to complete'}
          </p>
          <button
            className="w-full btn btn-secondary text-sm"
            onClick={cancelDrawing}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Current AOI display */}
      {aoi && (
        <div className="p-3 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">
              {aoi.name || 'Selected Region'}
            </span>
            <button
              className="text-slate-400 hover:text-red-400 transition-colors"
              onClick={clearAOI}
              aria-label="Clear region"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {aoi.coordinates.length} vertices
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-slate-500">
        Draw a region to compute spatial statistics and aggregated metrics.
      </div>
    </div>
  );
}
