import { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TimelineSlider } from './components/controls/TimelineSlider';
import { useMapStore } from './stores/mapStore';
import { useUIStore } from './stores/uiStore';
import { useDataStore } from './stores/dataStore';
import { useDatasets } from './hooks/useClimateData';

// Lazy load heavy components
const CesiumGlobe = lazy(() => import('./components/globe/CesiumGlobe').then(m => ({ default: m.CesiumGlobe })));
const DeckGLMap = lazy(() => import('./components/map/DeckGLMap').then(m => ({ default: m.DeckGLMap })));
const Timeseries = lazy(() => import('./components/charts/Timeseries').then(m => ({ default: m.Timeseries })));

type ViewMode = '3d' | '2d';

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <div className="text-white">Loading...</div>
    </div>
  );
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const { selectedPoint, setSelectedPoint } = useMapStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { setDatasets, selectDataset, selectedDatasetId } = useDataStore();

  // Fetch datasets from API
  const { data: datasets } = useDatasets();

  // Auto-select first dataset when loaded
  useEffect(() => {
    if (datasets && datasets.length > 0) {
      setDatasets(datasets);
      // Select ERA5 temperature by default, or first available
      const defaultDataset = datasets.find(d => d.id === 'era5-t2m') || datasets[0];
      if (!selectedDatasetId && defaultDataset) {
        selectDataset(defaultDataset.id);
      }
    }
  }, [datasets, setDatasets, selectDataset, selectedDatasetId]);

  const handlePointSelect = useCallback(
    (lat: number, lon: number) => {
      setSelectedPoint({ lat, lon });
    },
    [setSelectedPoint]
  );

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header viewMode={viewMode} onViewModeChange={setViewMode} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 relative"
          role="main"
          aria-label="Climate data visualization"
        >
          {/* Map/Globe view */}
          <div className="absolute inset-0">
            <Suspense fallback={<LoadingFallback />}>
              {viewMode === '3d' ? (
                <CesiumGlobe onPointSelect={handlePointSelect} />
              ) : (
                <DeckGLMap onPointSelect={handlePointSelect} />
              )}
            </Suspense>
          </div>

          {/* Timeline control */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[1000]">
            <TimelineSlider />
          </div>

          {/* Timeseries chart (when point selected) */}
          {selectedPoint && (
            <div className="absolute top-4 right-4 w-96 z-[1000]">
              <Suspense fallback={<LoadingFallback />}>
                <Timeseries
                  lat={selectedPoint.lat}
                  lon={selectedPoint.lon}
                  onClose={() => setSelectedPoint(null)}
                />
              </Suspense>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
