/**
 * 3D Globe visualization using CesiumJS directly (no Resium).
 */

import { useRef, useEffect } from 'react';
import {
  Viewer,
  Cartesian2,
  Cartesian3,
  ScreenSpaceEventType,
  UrlTemplateImageryProvider,
  Math as CesiumMath,
  Color,
  ScreenSpaceEventHandler,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useMapStore } from '../../stores/mapStore';
import { announceToScreenReader, formatCoordinatesForScreenReader } from '../../utils/accessibility';

interface CesiumGlobeProps {
  onPointSelect: (lat: number, lon: number) => void;
}

export function CesiumGlobe({ onPointSelect }: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const entityRef = useRef<any>(null);
  const { selectedPoint } = useMapStore();

  // Initialize Cesium viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      creditContainer: document.createElement('div'), // Hide credits
    });

    viewerRef.current = viewer;

    // Configure globe appearance
    viewer.scene.globe.baseColor = Color.fromCssColorString('#0f172a');
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.showGroundAtmosphere = true;

    // Add dark basemap
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(
      new UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        credit: 'CartoDB',
      })
    );

    // Set initial view
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(0, 20, 20000000),
    });

    // Disable default double-click zoom
    viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    // Cleanup on unmount
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Set up click handler
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement: { position: Cartesian2 }) => {
      const cartesian = viewer.camera.pickEllipsoid(
        movement.position,
        viewer.scene.globe.ellipsoid
      );

      if (cartesian) {
        const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        const lat = CesiumMath.toDegrees(cartographic.latitude);
        const lon = CesiumMath.toDegrees(cartographic.longitude);

        onPointSelect(lat, lon);
        announceToScreenReader(
          `Selected point at ${formatCoordinatesForScreenReader(lat, lon)}`
        );
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [onPointSelect]);

  // Update marker when selected point changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Remove existing marker
    if (entityRef.current) {
      viewer.entities.remove(entityRef.current);
      entityRef.current = null;
    }

    // Add new marker if point selected
    if (selectedPoint) {
      entityRef.current = viewer.entities.add({
        position: Cartesian3.fromDegrees(selectedPoint.lon, selectedPoint.lat),
        point: {
          pixelSize: 12,
          color: Color.fromCssColorString('#3b82f6'),
          outlineColor: Color.WHITE,
          outlineWidth: 2,
        },
      });
    }
  }, [selectedPoint]);

  return (
    <div className="w-full h-full relative" role="application" aria-label="3D Globe visualization">
      <div ref={containerRef} className="w-full h-full" />

      {/* Coordinates display */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 panel px-3 py-2 text-sm z-[1000]">
          <span className="text-slate-400">Selected: </span>
          <span className="text-white font-mono">
            {selectedPoint.lat.toFixed(4)}°, {selectedPoint.lon.toFixed(4)}°
          </span>
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute top-4 left-4 panel px-3 py-2 z-[1000]">
        <div className="text-sm text-white font-medium">3D Globe View</div>
        <div className="text-xs text-slate-400">Drag to rotate, scroll to zoom</div>
      </div>

      {/* Keyboard instructions (screen reader) */}
      <div className="sr-only" aria-live="polite">
        Use mouse to rotate the globe. Click to select a location.
      </div>
    </div>
  );
}
