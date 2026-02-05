import { useState, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CesiumGlobe } from './components/globe/CesiumGlobe';
import { DeckGLMap } from './components/map/DeckGLMap';
import { Timeseries } from './components/charts/Timeseries';
import { TimelineSlider } from './components/controls/TimelineSlider';
import { useMapStore } from './stores/mapStore';
import { useUIStore } from './stores/uiStore';

type ViewMode = '3d' | '2d';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const { selectedPoint, setSelectedPoint } = useMapStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handlePointSelect = useCallback(
    (lat: number, lon: number) => {
      setSelectedPoint({ lat, lon });
    },
    [setSelectedPoint]
  );

  return (
    <div className="h-full flex flex-col">
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
            {viewMode === '3d' ? (
              <CesiumGlobe onPointSelect={handlePointSelect} />
            ) : (
              <DeckGLMap onPointSelect={handlePointSelect} />
            )}
          </div>

          {/* Timeline control */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
            <TimelineSlider />
          </div>

          {/* Timeseries chart (when point selected) */}
          {selectedPoint && (
            <div className="absolute top-4 right-4 w-96">
              <Timeseries
                lat={selectedPoint.lat}
                lon={selectedPoint.lon}
                onClose={() => setSelectedPoint(null)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
