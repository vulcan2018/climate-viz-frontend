/**
 * Value range control for color scale.
 */

import { useState, useCallback } from 'react';
import { useDataStore } from '../../stores/dataStore';

export function ValueRange() {
  const { valueRange, setValueRange, colormap } = useDataStore();
  const [localMin, setLocalMin] = useState(valueRange.min.toString());
  const [localMax, setLocalMax] = useState(valueRange.max.toString());

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalMin(e.target.value);
    },
    []
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalMax(e.target.value);
    },
    []
  );

  const handleMinBlur = useCallback(() => {
    const value = parseFloat(localMin);
    if (!isNaN(value) && value < valueRange.max) {
      setValueRange({ min: value, autoScale: false });
    } else {
      setLocalMin(valueRange.min.toString());
    }
  }, [localMin, valueRange.max, valueRange.min, setValueRange]);

  const handleMaxBlur = useCallback(() => {
    const value = parseFloat(localMax);
    if (!isNaN(value) && value > valueRange.min) {
      setValueRange({ max: value, autoScale: false });
    } else {
      setLocalMax(valueRange.max.toString());
    }
  }, [localMax, valueRange.min, valueRange.max, setValueRange]);

  const handleAutoScale = useCallback(() => {
    setValueRange({ autoScale: !valueRange.autoScale });
    if (!valueRange.autoScale) {
      // Reset to default range when enabling auto-scale
      setValueRange({ min: 220, max: 320, autoScale: true });
      setLocalMin('220');
      setLocalMax('320');
    }
  }, [valueRange.autoScale, setValueRange]);

  // Convert Kelvin to Celsius for display
  const minCelsius = valueRange.min - 273.15;
  const maxCelsius = valueRange.max - 273.15;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label mb-0">Value Range</label>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={valueRange.autoScale}
            onChange={handleAutoScale}
            className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
          />
          Auto
        </label>
      </div>

      {/* Color bar preview */}
      <div className="relative">
        <div
          className="h-4 rounded"
          style={{
            background: `linear-gradient(to right, ${colormap.colors.join(', ')})`,
          }}
        />
        <div className="flex justify-between mt-1 text-xs text-slate-400">
          <span>{minCelsius.toFixed(0)}°C</span>
          <span>{maxCelsius.toFixed(0)}°C</span>
        </div>
      </div>

      {/* Min/Max inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Min (K)</label>
          <input
            type="number"
            value={localMin}
            onChange={handleMinChange}
            onBlur={handleMinBlur}
            disabled={valueRange.autoScale}
            className="input w-full disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Minimum value in Kelvin"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Max (K)</label>
          <input
            type="number"
            value={localMax}
            onChange={handleMaxChange}
            onBlur={handleMaxBlur}
            disabled={valueRange.autoScale}
            className="input w-full disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Maximum value in Kelvin"
          />
        </div>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2">
        <button
          className="flex-1 btn btn-secondary text-xs py-1"
          onClick={() => {
            setValueRange({ min: 220, max: 320, autoScale: false });
            setLocalMin('220');
            setLocalMax('320');
          }}
          disabled={valueRange.autoScale}
        >
          Global (-53 to 47°C)
        </button>
        <button
          className="flex-1 btn btn-secondary text-xs py-1"
          onClick={() => {
            setValueRange({ min: 260, max: 310, autoScale: false });
            setLocalMin('260');
            setLocalMax('310');
          }}
          disabled={valueRange.autoScale}
        >
          Temperate (-13 to 37°C)
        </button>
      </div>
    </div>
  );
}
