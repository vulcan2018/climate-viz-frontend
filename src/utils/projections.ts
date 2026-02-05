/**
 * Map projection utilities using proj4.
 */

import proj4 from 'proj4';
import type { ProjectionType } from '../types/map';

// Define projections
proj4.defs([
  ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'], // WGS84 (default)
  ['EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs'], // Web Mercator
  ['EPSG:3031', '+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'], // Antarctic Polar Stereographic
  ['EPSG:3995', '+proj=stere +lat_0=90 +lat_ts=71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'], // Arctic Polar Stereographic
]);

/**
 * Get EPSG code for a projection type.
 */
export function getEPSG(projection: ProjectionType): string {
  switch (projection) {
    case 'mercator':
      return 'EPSG:3857';
    case 'equirectangular':
      return 'EPSG:4326';
    case 'polar-north':
      return 'EPSG:3995';
    case 'polar-south':
      return 'EPSG:3031';
    default:
      return 'EPSG:4326';
  }
}

/**
 * Transform coordinates from WGS84 to target projection.
 */
export function transformCoordinates(
  lon: number,
  lat: number,
  targetProjection: ProjectionType
): [number, number] {
  const targetEPSG = getEPSG(targetProjection);

  if (targetEPSG === 'EPSG:4326') {
    return [lon, lat];
  }

  return proj4('EPSG:4326', targetEPSG, [lon, lat]) as [number, number];
}

/**
 * Transform coordinates from target projection to WGS84.
 */
export function inverseTransformCoordinates(
  x: number,
  y: number,
  sourceProjection: ProjectionType
): [number, number] {
  const sourceEPSG = getEPSG(sourceProjection);

  if (sourceEPSG === 'EPSG:4326') {
    return [x, y];
  }

  return proj4(sourceEPSG, 'EPSG:4326', [x, y]) as [number, number];
}

/**
 * Get projection display name.
 */
export function getProjectionName(projection: ProjectionType): string {
  switch (projection) {
    case 'mercator':
      return 'Web Mercator';
    case 'equirectangular':
      return 'Equirectangular';
    case 'orthographic':
      return 'Orthographic';
    case 'polar-north':
      return 'Arctic Polar';
    case 'polar-south':
      return 'Antarctic Polar';
    default:
      return projection;
  }
}

/**
 * Get available projections.
 */
export const AVAILABLE_PROJECTIONS: { id: ProjectionType; name: string }[] = [
  { id: 'mercator', name: 'Web Mercator' },
  { id: 'equirectangular', name: 'Equirectangular' },
  { id: 'polar-north', name: 'Arctic Polar' },
  { id: 'polar-south', name: 'Antarctic Polar' },
];
