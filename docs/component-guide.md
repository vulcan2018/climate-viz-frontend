# Component Guide

This guide documents the React components used in the climate visualization application.

## Layout Components

### Header
`src/components/layout/Header.tsx`

Application header with view mode toggle (3D/2D).

```tsx
<Header viewMode="3d" onViewModeChange={(mode) => setViewMode(mode)} />
```

### Sidebar
`src/components/layout/Sidebar.tsx`

Collapsible sidebar with tabbed navigation for layers, data, and analysis tools.

```tsx
<Sidebar isOpen={true} onToggle={() => toggleSidebar()} />
```

### ResponsiveLayout
`src/components/layout/ResponsiveLayout.tsx`

Wrapper for responsive content that adapts to screen size.

## Globe Components

### CesiumGlobe
`src/components/globe/CesiumGlobe.tsx`

3D globe visualization using CesiumJS. Features:
- CartoDB dark basemap
- Click-to-select point
- Marker for selected location

```tsx
<CesiumGlobe onPointSelect={(lat, lon) => handleSelect(lat, lon)} />
```

### GlobeControls
`src/components/globe/GlobeControls.tsx`

Zoom and navigation controls for the 3D globe.

## Map Components

### DeckGLMap
`src/components/map/DeckGLMap.tsx`

2D map visualization using Deck.gl. Features:
- GPU-accelerated rendering
- Color-coded data overlay
- Tooltip on hover

```tsx
<DeckGLMap onPointSelect={(lat, lon) => handleSelect(lat, lon)} />
```

### MapProjection
`src/components/map/MapProjection.tsx`

Dropdown selector for map projection (Mercator, Equirectangular, Polar).

### LayerControls
`src/components/map/LayerControls.tsx`

Layer visibility and opacity controls.

## Chart Components

### Timeseries
`src/components/charts/Timeseries.tsx`

Line chart showing temporal data at a selected point. Uses Recharts.

```tsx
<Timeseries lat={51.5} lon={-0.1} onClose={() => clearSelection()} />
```

### RegionalStats
`src/components/charts/RegionalStats.tsx`

Statistics display for a selected region (mean, std, min, max, percentiles).

### UncertaintyBand
`src/components/charts/UncertaintyBand.tsx`

Area chart showing climatological percentile bands (10th-90th, 25th-75th).

## Control Components

### TimelineSlider
`src/components/controls/TimelineSlider.tsx`

Temporal animation controls with play/pause, scrubbing, and speed adjustment.

### ColormapSelector
`src/components/controls/ColormapSelector.tsx`

Dropdown for selecting color scale with preview.

### ValueRange
`src/components/controls/ValueRange.tsx`

Input fields for min/max value range with presets.

### AOIDrawer
`src/components/controls/AOIDrawer.tsx`

Tools for drawing area-of-interest regions on the map.

## State Management

### Zustand Stores

- **mapStore**: View state, selected point, animation state
- **dataStore**: Datasets, current grid data, colormap settings
- **uiStore**: Sidebar state, user preferences (persisted)

## Hooks

### useClimateData
Fetch available datasets and grid data.

### useTimeseries
Fetch time series data for a point location.

### useRegionalStats
Compute statistics for an area of interest.

## Utilities

### colormaps.ts
Color scale definitions and conversion functions.

### projections.ts
Map projection configurations using proj4.

### accessibility.ts
ARIA helpers, screen reader announcements, keyboard utilities.
