/**
 * Hook for fetching timeseries data at a point.
 */

import { useQuery } from '@tanstack/react-query';
import type { TimeseriesData, Trend, Anomaly, Percentiles } from '../types/climate';

const API_BASE = import.meta.env.VITE_API_URL || 'https://climate-data-pipeline.vercel.app';

/**
 * Fetch timeseries data for a point.
 */
export function useTimeseries(
  datasetId: string | null,
  lat: number | null,
  lon: number | null,
  startDate?: string,
  endDate?: string
) {
  return useQuery<TimeseriesData>({
    queryKey: ['timeseries', datasetId, lat, lon, startDate, endDate],
    queryFn: async () => {
      if (!datasetId || lat === null || lon === null) {
        throw new Error('Missing parameters');
      }

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      });

      const response = await fetch(
        `${API_BASE}/api/v1/data/datasets/${datasetId}/point?${params}`
      );
      if (!response.ok) throw new Error('Failed to fetch timeseries');
      const data = await response.json();

      return {
        times: data.data.times,
        values: data.data.values,
        units: data.units,
        variable: data.variable,
        location: { lat, lon },
      };
    },
    enabled: !!datasetId && lat !== null && lon !== null,
  });
}

/**
 * Fetch trend analysis for a point.
 */
export function useTrend(
  datasetId: string | null,
  lat: number | null,
  lon: number | null,
  startYear?: number,
  endYear?: number
) {
  return useQuery<Trend>({
    queryKey: ['trend', datasetId, lat, lon, startYear, endYear],
    queryFn: async () => {
      if (!datasetId || lat === null || lon === null) {
        throw new Error('Missing parameters');
      }

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        ...(startYear && { start_year: startYear.toString() }),
        ...(endYear && { end_year: endYear.toString() }),
      });

      const response = await fetch(
        `${API_BASE}/api/v1/metrics/trend/${datasetId}?${params}`
      );
      if (!response.ok) throw new Error('Failed to fetch trend');
      const data = await response.json();

      return {
        slope: data.trend.slope,
        slopeUnits: data.trend.slope_units,
        pValue: data.trend.p_value,
        significant: data.trend.significant,
        confidenceInterval: data.trend.confidence_interval,
        period: data.period,
      };
    },
    enabled: !!datasetId && lat !== null && lon !== null,
  });
}

/**
 * Fetch anomaly for a specific time.
 */
export function useAnomaly(
  datasetId: string | null,
  lat: number | null,
  lon: number | null,
  time: string | null,
  type: 'absolute' | 'standardized' = 'absolute'
) {
  return useQuery<Anomaly>({
    queryKey: ['anomaly', datasetId, lat, lon, time, type],
    queryFn: async () => {
      if (!datasetId || lat === null || lon === null || !time) {
        throw new Error('Missing parameters');
      }

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        time,
        anomaly_type: type,
      });

      const response = await fetch(
        `${API_BASE}/api/v1/metrics/anomaly/${datasetId}?${params}`
      );
      if (!response.ok) throw new Error('Failed to fetch anomaly');
      const data = await response.json();

      return {
        value: data.anomaly.value,
        type: data.anomaly.type,
        units: data.anomaly.units,
        referencePeriod: data.reference_period,
        classification: data.classification,
      };
    },
    enabled: !!datasetId && lat !== null && lon !== null && !!time,
  });
}

/**
 * Fetch percentiles for a location.
 */
export function usePercentiles(
  datasetId: string | null,
  lat: number | null,
  lon: number | null
) {
  return useQuery<Percentiles>({
    queryKey: ['percentiles', datasetId, lat, lon],
    queryFn: async () => {
      if (!datasetId || lat === null || lon === null) {
        throw new Error('Missing parameters');
      }

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
      });

      const response = await fetch(
        `${API_BASE}/api/v1/metrics/percentiles/${datasetId}?${params}`
      );
      if (!response.ok) throw new Error('Failed to fetch percentiles');
      const data = await response.json();

      return {
        months: data.values.months,
        p10: data.values.p10,
        p25: data.values.p25,
        p50: data.values.p50,
        p75: data.values.p75,
        p90: data.values.p90,
        p95: data.values.p95,
        p99: data.values.p99,
      };
    },
    enabled: !!datasetId && lat !== null && lon !== null,
  });
}
