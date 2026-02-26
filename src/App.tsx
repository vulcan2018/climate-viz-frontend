import { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Box, Flex, Center, Loader, Text } from '@mantine/core';
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
    <Center w="100%" h="100%" bg="dark.8">
      <Flex direction="column" align="center" gap="sm">
        <Loader color="blue" size="lg" />
        <Text c="dimmed">Loading...</Text>
      </Flex>
    </Center>
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
    <Flex direction="column" h="100%" bg="dark.8">
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header viewMode={viewMode} onViewModeChange={setViewMode} />

      <Flex flex={1} style={{ overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        {/* Main content */}
        <Box
          component="main"
          id="main-content"
          flex={1}
          pos="relative"
          role="main"
          aria-label="Climate data visualization"
        >
          {/* Map/Globe view */}
          <Box pos="absolute" top={0} left={0} right={0} bottom={0}>
            <Suspense fallback={<LoadingFallback />}>
              {viewMode === '3d' ? (
                <CesiumGlobe onPointSelect={handlePointSelect} />
              ) : (
                <DeckGLMap onPointSelect={handlePointSelect} />
              )}
            </Suspense>
          </Box>

          {/* Timeline control */}
          <Box
            pos="absolute"
            bottom={16}
            left="50%"
            w="100%"
            maw="42rem"
            px="md"
            style={{ transform: 'translateX(-50%)', zIndex: 1000 }}
          >
            <TimelineSlider />
          </Box>

          {/* Timeseries chart (when point selected) */}
          {selectedPoint && (
            <Box pos="absolute" top={16} right={16} w={384} style={{ zIndex: 1000 }}>
              <Suspense fallback={<LoadingFallback />}>
                <Timeseries
                  lat={selectedPoint.lat}
                  lon={selectedPoint.lon}
                  onClose={() => setSelectedPoint(null)}
                />
              </Suspense>
            </Box>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}

export default App;
