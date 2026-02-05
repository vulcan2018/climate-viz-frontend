/**
 * Camera and projection controls for the 3D globe.
 */

import { RefObject, useCallback } from 'react';
import { Cartesian3 } from 'cesium';
import type { Viewer as CesiumViewer } from 'cesium';

interface GlobeControlsProps {
  viewerRef: RefObject<CesiumViewer | null>;
}

export function GlobeControls({ viewerRef }: GlobeControlsProps) {
  const zoomIn = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.2);
  }, [viewerRef]);

  const zoomOut = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.2);
  }, [viewerRef]);

  const resetView = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(0, 20, 20000000),
      duration: 1.5,
    });
  }, [viewerRef]);

  const flyToLocation = useCallback(
    (lon: number, lat: number, height: number = 5000000) => {
      const viewer = viewerRef.current;
      if (!viewer) return;

      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(lon, lat, height),
        duration: 1.5,
      });
    },
    [viewerRef]
  );

  return (
    <div
      className="absolute bottom-20 right-4 flex flex-col gap-2"
      role="toolbar"
      aria-label="Globe controls"
    >
      {/* Zoom controls */}
      <div className="panel p-1 flex flex-col gap-1">
        <button
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          onClick={zoomIn}
          aria-label="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        </button>
        <button
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          onClick={zoomOut}
          aria-label="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>

      {/* Reset view */}
      <div className="panel p-1">
        <button
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          onClick={resetView}
          aria-label="Reset view to default"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
            />
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
          </svg>
        </button>
      </div>

      {/* Quick fly-to buttons */}
      <div className="panel p-1 flex flex-col gap-1">
        <button
          className="p-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          onClick={() => flyToLocation(0, 51.5, 3000000)}
          aria-label="Fly to Europe"
          title="Europe"
        >
          EU
        </button>
        <button
          className="p-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          onClick={() => flyToLocation(-100, 40, 8000000)}
          aria-label="Fly to North America"
          title="North America"
        >
          NA
        </button>
        <button
          className="p-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          onClick={() => flyToLocation(100, 35, 8000000)}
          aria-label="Fly to Asia"
          title="Asia"
        >
          AS
        </button>
      </div>
    </div>
  );
}
