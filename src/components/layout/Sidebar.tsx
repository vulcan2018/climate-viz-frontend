/**
 * Sidebar with layer controls, data selection, and analysis tools.
 */

import { useUIStore } from '../../stores/uiStore';
import { useDataStore } from '../../stores/dataStore';
import { useDatasets } from '../../hooks/useClimateData';
import { ColormapSelector } from '../controls/ColormapSelector';
import { ValueRange } from '../controls/ValueRange';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { sidebarTab, setSidebarTab } = useUIStore();
  const { selectedDatasetId, selectDataset } = useDataStore();
  const { data: datasets, isLoading } = useDatasets();

  return (
    <>
      {/* Toggle button */}
      <button
        className="absolute top-20 left-0 z-20 bg-slate-800 border border-slate-700 rounded-r-md p-2 text-slate-400 hover:text-white transition-colors"
        onClick={onToggle}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isOpen}
      >
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Sidebar panel */}
      <aside
        className={`bg-slate-900 border-r border-slate-700 w-80 flex-shrink-0 transition-all duration-300 overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full w-0'
        }`}
        role="complementary"
        aria-label="Controls panel"
      >
        <div className="h-full flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-slate-700" role="tablist">
            {(['layers', 'data', 'analysis'] as const).map((tab) => (
              <button
                key={tab}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                  sidebarTab === tab
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setSidebarTab(tab)}
                role="tab"
                aria-selected={sidebarTab === tab}
                aria-controls={`${tab}-panel`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            {sidebarTab === 'layers' && (
              <div
                id="layers-panel"
                role="tabpanel"
                aria-labelledby="layers-tab"
              >
                <h2 className="text-sm font-semibold text-slate-300 mb-3">
                  Visualization Settings
                </h2>

                <div className="space-y-6">
                  <ColormapSelector />
                  <ValueRange />
                </div>
              </div>
            )}

            {sidebarTab === 'data' && (
              <div
                id="data-panel"
                role="tabpanel"
                aria-labelledby="data-tab"
              >
                <h2 className="text-sm font-semibold text-slate-300 mb-3">
                  Select Dataset
                </h2>

                {isLoading ? (
                  <p className="text-slate-400 text-sm">Loading datasets...</p>
                ) : (
                  <div className="space-y-2">
                    {datasets?.map((dataset) => (
                      <button
                        key={dataset.id}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedDatasetId === dataset.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                        onClick={() => selectDataset(dataset.id)}
                        aria-pressed={selectedDatasetId === dataset.id}
                      >
                        <div className="font-medium">{dataset.name}</div>
                        <div className="text-sm opacity-75">
                          {dataset.variable} ({dataset.units})
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sidebarTab === 'analysis' && (
              <div
                id="analysis-panel"
                role="tabpanel"
                aria-labelledby="analysis-tab"
              >
                <h2 className="text-sm font-semibold text-slate-300 mb-3">
                  Analysis Tools
                </h2>

                <div className="space-y-4">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <h3 className="font-medium text-white mb-1">
                      Point Analysis
                    </h3>
                    <p className="text-sm text-slate-400">
                      Click on the map to select a point and view its timeseries.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-lg">
                    <h3 className="font-medium text-white mb-1">
                      Regional Statistics
                    </h3>
                    <p className="text-sm text-slate-400">
                      Draw a region to compute spatial statistics.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-lg">
                    <h3 className="font-medium text-white mb-1">
                      Trend Analysis
                    </h3>
                    <p className="text-sm text-slate-400">
                      Compute linear trends with statistical significance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700 p-4">
            <p className="text-xs text-slate-500">
              Data: ERA5 Reanalysis
            </p>
            <p className="text-xs text-slate-500">
              Built by FIRA Software Ltd
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
