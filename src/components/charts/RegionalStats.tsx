/**
 * Regional statistics display component.
 */

import { useRegionalStats } from '../../hooks/useRegionalStats';
import { useDataStore } from '../../stores/dataStore';
import type { BoundingBox } from '../../types/climate';

interface RegionalStatsProps {
  bbox: BoundingBox;
  onClose: () => void;
}

export function RegionalStats({ bbox, onClose }: RegionalStatsProps) {
  const { selectedDatasetId } = useDataStore();
  const { data: stats, isLoading, error } = useRegionalStats(selectedDatasetId, bbox);

  const formatTemp = (kelvin: number) => {
    const celsius = kelvin - 273.15;
    return `${celsius.toFixed(1)}°C`;
  };

  return (
    <div className="panel p-4" role="region" aria-label="Regional statistics">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Regional Statistics</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {bbox.south.toFixed(1)}° to {bbox.north.toFixed(1)}°N,{' '}
            {bbox.west.toFixed(1)}° to {bbox.east.toFixed(1)}°E
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Close regional statistics panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="py-8 flex items-center justify-center text-red-400 text-sm">
          Failed to load statistics
        </div>
      )}

      {/* Stats display */}
      {!isLoading && !error && stats && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Mean</div>
              <div className="text-lg font-semibold text-white">{formatTemp(stats.mean)}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Std Dev</div>
              <div className="text-lg font-semibold text-white">{stats.std.toFixed(1)} K</div>
            </div>
          </div>

          {/* Range */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-2">Range</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-400">Min</div>
                <div className="text-sm font-medium text-white">{formatTemp(stats.min)}</div>
              </div>
              <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-blue-500 via-slate-400 to-red-500 rounded" />
              <div className="text-right">
                <div className="text-xs text-red-400">Max</div>
                <div className="text-sm font-medium text-white">{formatTemp(stats.max)}</div>
              </div>
            </div>
          </div>

          {/* Percentiles */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-2">Percentiles</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-slate-500">10th</div>
                <div className="text-sm text-white">{formatTemp(stats.p10)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">50th</div>
                <div className="text-sm text-white font-medium">{formatTemp(stats.p50)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">90th</div>
                <div className="text-sm text-white">{formatTemp(stats.p90)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
