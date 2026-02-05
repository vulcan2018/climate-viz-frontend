/**
 * 2D Map visualization using Leaflet.
 */

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '../../stores/mapStore';
import { useUIStore } from '../../stores/uiStore';
import { MapProjection } from './MapProjection';
import { LayerControls } from './LayerControls';
import { TemperatureLayer } from './TemperatureLayer';
import { announceToScreenReader, formatCoordinatesForScreenReader } from '../../utils/accessibility';

interface DeckGLMapProps {
  onPointSelect: (lat: number, lon: number) => void;
}

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom blue marker icon
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Click handler component
function MapClickHandler({ onPointSelect }: { onPointSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPointSelect(lat, lng);
      announceToScreenReader(
        `Selected point at ${formatCoordinatesForScreenReader(lat, lng)}`
      );
    },
  });
  return null;
}

export function DeckGLMap({ onPointSelect }: DeckGLMapProps) {
  const { selectedPoint } = useMapStore();
  const { showTemperature, temperatureOpacity } = useUIStore();

  return (
    <div
      className="w-full h-full relative"
      role="application"
      aria-label="2D Map visualization"
    >
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="w-full h-full"
        style={{ background: '#0f172a' }}
      >
        {/* Dark basemap tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        {/* Temperature overlay from ERA5 data */}
        <TemperatureLayer
          opacity={temperatureOpacity}
          visible={showTemperature}
        />

        {/* Click handler */}
        <MapClickHandler onPointSelect={onPointSelect} />

        {/* Selected point marker */}
        {selectedPoint && (
          <Marker
            position={[selectedPoint.lat, selectedPoint.lon]}
            icon={blueIcon}
          />
        )}
      </MapContainer>

      {/* Overlay info */}
      <div className="absolute top-4 left-4 panel px-3 py-2 z-[1000]">
        <div className="text-sm text-white font-medium">2D Map View</div>
        <div className="text-xs text-slate-400">Click anywhere to select a point</div>
      </div>

      {/* Projection selector */}
      <div className="absolute top-20 left-4 z-[1000]">
        <MapProjection />
      </div>

      {/* Layer controls */}
      <div className="absolute bottom-20 right-4 z-[1000]">
        <LayerControls />
      </div>

      {/* Coordinates display */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 panel px-3 py-2 text-sm z-[1000]">
          <span className="text-slate-400">Selected: </span>
          <span className="text-white font-mono">
            {selectedPoint.lat.toFixed(4)}°, {selectedPoint.lon.toFixed(4)}°
          </span>
        </div>
      )}

      {/* Keyboard instructions (screen reader) */}
      <div className="sr-only" aria-live="polite">
        Click on the map to select a location. Use mouse to pan and zoom.
      </div>
    </div>
  );
}
