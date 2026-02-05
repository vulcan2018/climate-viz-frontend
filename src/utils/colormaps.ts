/**
 * Colormap definitions and utilities.
 */

import * as d3 from 'd3-scale-chromatic';
import { scaleSequential, scaleDiverging } from 'd3-scale';
import type { ColormapConfig } from '../types/map';

// Predefined colormaps
export const COLORMAPS: ColormapConfig[] = [
  {
    id: 'rdbu',
    name: 'Red-Blue (Diverging)',
    type: 'diverging',
    colors: ['#2166ac', '#67a9cf', '#d1e5f0', '#f7f7f7', '#fddbc7', '#ef8a62', '#b2182b'],
    colorBlindSafe: true,
  },
  {
    id: 'viridis',
    name: 'Viridis',
    type: 'sequential',
    colors: ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'],
    colorBlindSafe: true,
  },
  {
    id: 'plasma',
    name: 'Plasma',
    type: 'sequential',
    colors: ['#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921'],
    colorBlindSafe: true,
  },
  {
    id: 'inferno',
    name: 'Inferno',
    type: 'sequential',
    colors: ['#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60', '#cf4446', '#ed6925', '#fb9b06', '#f7d13d', '#fcffa4'],
    colorBlindSafe: true,
  },
  {
    id: 'coolwarm',
    name: 'Cool-Warm',
    type: 'diverging',
    colors: ['#3b4cc0', '#6788ee', '#9abbff', '#c9d7f0', '#edd1c2', '#f7a889', '#e26952', '#b40426'],
    colorBlindSafe: false,
  },
  {
    id: 'bwr',
    name: 'Blue-White-Red',
    type: 'diverging',
    colors: ['#0000ff', '#4444ff', '#8888ff', '#ffffff', '#ff8888', '#ff4444', '#ff0000'],
    colorBlindSafe: false,
  },
];

/**
 * Create a color scale function for a given colormap and value range.
 */
export function createColorScale(
  colormap: ColormapConfig,
  min: number,
  max: number
): (value: number) => string {
  if (colormap.type === 'diverging') {
    const mid = (min + max) / 2;
    return scaleDiverging<string>()
      .domain([min, mid, max])
      .interpolator(d3.interpolateRdBu)
      .clamp(true);
  }

  // Sequential
  const interpolator = getD3Interpolator(colormap.id);
  return scaleSequential<string>()
    .domain([min, max])
    .interpolator(interpolator)
    .clamp(true);
}

/**
 * Get D3 interpolator for a colormap ID.
 */
function getD3Interpolator(id: string): (t: number) => string {
  switch (id) {
    case 'viridis':
      return d3.interpolateViridis;
    case 'plasma':
      return d3.interpolatePlasma;
    case 'inferno':
      return d3.interpolateInferno;
    case 'rdbu':
      return d3.interpolateRdBu;
    case 'coolwarm':
      return d3.interpolateCool;
    default:
      return d3.interpolateViridis;
  }
}

/**
 * Convert a value to RGB array [r, g, b, a] for Deck.gl.
 */
export function valueToRGBA(
  value: number,
  colorScale: (v: number) => string,
  opacity: number = 255
): [number, number, number, number] {
  const color = colorScale(value);
  const rgb = hexToRgb(color);
  return [rgb.r, rgb.g, rgb.b, opacity];
}

/**
 * Convert hex color to RGB object.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Handle rgb() format from d3
  if (hex.startsWith('rgb')) {
    const match = hex.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
    }
  }

  // Handle hex format
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 128, g: 128, b: 128 };
}

/**
 * Generate a color legend with tick marks.
 */
export function generateLegendTicks(
  min: number,
  max: number,
  numTicks: number = 5
): { value: number; label: string }[] {
  const step = (max - min) / (numTicks - 1);
  return Array.from({ length: numTicks }, (_, i) => {
    const value = min + i * step;
    return {
      value,
      label: value.toFixed(1),
    };
  });
}
