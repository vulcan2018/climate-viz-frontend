/**
 * Climate data type definitions.
 */

export interface Dataset {
  id: string;
  name: string;
  variable: string;
  units: string;
  temporalRange: {
    start: string;
    end: string;
  };
  spatialResolution: number;
  description?: string;
}

export interface TimeseriesData {
  times: string[];
  values: number[];
  units: string;
  variable: string;
  location: {
    lat: number;
    lon: number;
  };
}

export interface GridData {
  lats: number[];
  lons: number[];
  values: number[][];
  time: string;
  variable: string;
  units: string;
}

export interface Climatology {
  months: number[];
  values: number[];
  units: string;
}

export interface Anomaly {
  value: number;
  type: 'absolute' | 'standardized';
  units: string;
  referencePeriod: {
    start: number;
    end: number;
  };
  classification: {
    level: number;
    label: string;
  };
}

export interface Trend {
  slope: number;
  slopeUnits: string;
  pValue: number;
  significant: boolean;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  period: {
    start: number;
    end: number;
  };
}

export interface Percentiles {
  months: number[];
  p10: number[];
  p25: number[];
  p50: number[];
  p75: number[];
  p90: number[];
  p95: number[];
  p99: number[];
}

export interface RegionalStats {
  bbox: BoundingBox;
  mean: number;
  std: number;
  min: number;
  max: number;
  p10: number;
  p50: number;
  p90: number;
  units: string;
}

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}
