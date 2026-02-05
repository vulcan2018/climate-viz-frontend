/**
 * React Query hooks for fetching climate data.
 */

import { useQuery } from '@tanstack/react-query';
import type { Dataset, GridData } from '../types/climate';

const API_BASE = import.meta.env.VITE_API_URL || 'https://climate-data-pipeline.vercel.app';

/**
 * Fetch all available datasets.
 */
export function useDatasets() {
  return useQuery<Dataset[]>({
    queryKey: ['datasets'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/v1/data/datasets`);
      if (!response.ok) throw new Error('Failed to fetch datasets');
      const data = await response.json();
      return data.datasets.map((d: Record<string, unknown>) => ({
        id: d.id,
        name: d.name,
        variable: d.variable,
        units: d.units || 'K',
        temporalRange: {
          start: '1940-01-01',
          end: '2024-12-31',
        },
        spatialResolution: 0.25,
        description: d.description,
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch a specific dataset.
 */
export function useDataset(datasetId: string | null) {
  return useQuery<Dataset>({
    queryKey: ['dataset', datasetId],
    queryFn: async () => {
      if (!datasetId) throw new Error('No dataset ID');
      const response = await fetch(`${API_BASE}/api/v1/data/datasets/${datasetId}`);
      if (!response.ok) throw new Error('Failed to fetch dataset');
      const d = await response.json();
      return {
        id: d.id,
        name: d.name,
        variable: d.variable,
        units: d.units || 'K',
        temporalRange: {
          start: '1940-01-01',
          end: '2024-12-31',
        },
        spatialResolution: 0.25,
        description: d.description,
      };
    },
    enabled: !!datasetId,
  });
}

/**
 * Fetch grid data for a region and time.
 */
export function useGridData(
  datasetId: string | null,
  bounds: { west: number; south: number; east: number; north: number } | null,
  time: string | null
) {
  return useQuery<GridData>({
    queryKey: ['gridData', datasetId, bounds, time],
    queryFn: async () => {
      if (!datasetId || !bounds) throw new Error('Missing parameters');

      const params = new URLSearchParams({
        west: bounds.west.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        north: bounds.north.toString(),
        ...(time && { time }),
      });

      const response = await fetch(
        `${API_BASE}/api/v1/data/datasets/${datasetId}/region?${params}`
      );
      if (!response.ok) throw new Error('Failed to fetch grid data');
      const data = await response.json();

      return {
        lats: data.grid.lats,
        lons: data.grid.lons,
        values: data.grid.values,
        time: data.time,
        variable: data.variable,
        units: data.units,
      };
    },
    enabled: !!datasetId && !!bounds,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
