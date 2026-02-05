/**
 * Layer opacity and ordering controls.
 */

import { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
}

export function LayerControls() {
  const {
    showLabels, setShowLabels,
    showGrid, setShowGrid,
    showTemperature, setShowTemperature,
    temperatureOpacity, setTemperatureOpacity
  } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);

  const [layers, setLayers] = useState<Layer[]>([
    { id: 'basemap', name: 'Base Map', visible: true, opacity: 1 },
    { id: 'temperature', name: 'Temperature (ERA5)', visible: showTemperature, opacity: temperatureOpacity },
    { id: 'labels', name: 'Labels', visible: showLabels, opacity: 1 },
    { id: 'grid', name: 'Lat/Lon Grid', visible: showGrid, opacity: 0.5 },
  ]);

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );

    if (id === 'labels') {
      setShowLabels(!showLabels);
    } else if (id === 'grid') {
      setShowGrid(!showGrid);
    } else if (id === 'temperature') {
      setShowTemperature(!showTemperature);
    }
  };

  const setOpacity = (id: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, opacity } : layer))
    );

    if (id === 'temperature') {
      setTemperatureOpacity(opacity);
    }
  };

  return (
    <div className="relative">
      <button
        className="panel p-2 text-slate-300 hover:text-white transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Layer controls"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 panel p-3 w-64">
          <h3 className="text-sm font-semibold text-white mb-3">Layers</h3>

          <div className="space-y-3">
            {layers.map((layer) => (
              <div key={layer.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={() => toggleLayer(layer.id)}
                      className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    {layer.name}
                  </label>
                </div>

                {layer.visible && (
                  <div className="flex items-center gap-2 pl-6">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={layer.opacity}
                      onChange={(e) => setOpacity(layer.id, parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      aria-label={`${layer.name} opacity`}
                    />
                    <span className="text-xs text-slate-400 w-8">
                      {Math.round(layer.opacity * 100)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
