/**
 * 3D Globe visualization using CesiumJS/Resium.
 */

import { useRef, useCallback } from 'react';
import { Viewer, Entity, ImageryLayer, Globe } from 'resium';
import {
  Cartesian2,
  Cartesian3,
  ScreenSpaceEventType,
  UrlTemplateImageryProvider,
  Math as CesiumMath,
  Color,
} from 'cesium';
import { useMapStore } from '../../stores/mapStore';
import { GlobeControls } from './GlobeControls';
import { announceToScreenReader, formatCoordinatesForScreenReader } from '../../utils/accessibility';
import type { Viewer as CesiumViewer } from 'cesium';

interface CesiumGlobeProps {
  onPointSelect: (lat: number, lon: number) => void;
}

export function CesiumGlobe({ onPointSelect }: CesiumGlobeProps) {
  const viewerRef = useRef<CesiumViewer | null>(null);
  const { selectedPoint } = useMapStore();

  // Handle click on globe
  const handleClick = useCallback(
    (movement: { position: { x: number; y: number } }) => {
      const viewer = viewerRef.current;
      if (!viewer) return;

      const position = new Cartesian2(movement.position.x, movement.position.y);
      const cartesian = viewer.camera.pickEllipsoid(
        position,
        viewer.scene.globe.ellipsoid
      );

      if (cartesian) {
        const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        const lat = CesiumMath.toDegrees(cartographic.latitude);
        const lon = CesiumMath.toDegrees(cartographic.longitude);

        onPointSelect(lat, lon);

        // Announce to screen reader
        announceToScreenReader(
          `Selected point at ${formatCoordinatesForScreenReader(lat, lon)}`
        );
      }
    },
    [onPointSelect]
  );

  // Set up click handler when viewer is ready
  const handleViewerReady = useCallback(
    (viewer: CesiumViewer) => {
      viewerRef.current = viewer;

      // Disable default double-click zoom
      viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      // Add click handler
      viewer.screenSpaceEventHandler.setInputAction(
        handleClick,
        ScreenSpaceEventType.LEFT_CLICK
      );

      // Set initial view
      viewer.camera.setView({
        destination: Cartesian3.fromDegrees(0, 20, 20000000),
      });
    },
    [handleClick]
  );

  return (
    <div className="w-full h-full relative" role="application" aria-label="3D Globe visualization">
      <Viewer
        full
        ref={(e) => {
          if (e?.cesiumElement) {
            handleViewerReady(e.cesiumElement);
          }
        }}
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        sceneModePicker={false}
        selectionIndicator={false}
        navigationHelpButton={false}
        fullscreenButton={false}
        infoBox={false}
        creditContainer={document.createElement('div')} // Hide credits
      >
        <Globe
          enableLighting={false}
          showGroundAtmosphere={true}
          baseColor={Color.fromCssColorString('#0f172a')}
        />

        {/* Dark base map */}
        <ImageryLayer
          imageryProvider={
            new UrlTemplateImageryProvider({
              url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
              credit: 'CartoDB',
            })
          }
        />

        {/* Selected point marker */}
        {selectedPoint && (
          <Entity
            position={Cartesian3.fromDegrees(selectedPoint.lon, selectedPoint.lat)}
            point={{
              pixelSize: 12,
              color: Color.fromCssColorString('#3b82f6'),
              outlineColor: Color.WHITE,
              outlineWidth: 2,
            }}
            description={`Location: ${selectedPoint.lat.toFixed(2)}°, ${selectedPoint.lon.toFixed(2)}°`}
          />
        )}
      </Viewer>

      {/* Globe controls overlay */}
      <GlobeControls viewerRef={viewerRef} />

      {/* Keyboard instructions (screen reader) */}
      <div className="sr-only" aria-live="polite">
        Use arrow keys to rotate the globe. Press Enter or Space to select a location.
        Use + and - keys to zoom in and out.
      </div>
    </div>
  );
}
