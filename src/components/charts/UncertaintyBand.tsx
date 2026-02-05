/**
 * Uncertainty band visualization for confidence intervals.
 */

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePercentiles } from '../../hooks/useTimeseries';
import { useDataStore } from '../../stores/dataStore';

interface UncertaintyBandProps {
  lat: number;
  lon: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function UncertaintyBand({ lat, lon }: UncertaintyBandProps) {
  const { selectedDatasetId } = useDataStore();
  const { data: percentiles, isLoading, error } = usePercentiles(selectedDatasetId, lat, lon);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!percentiles) return [];

    return percentiles.months.map((month, i) => ({
      month: MONTHS[month - 1],
      p10: percentiles.p10[i] - 273.15,
      p25: percentiles.p25[i] - 273.15,
      p50: percentiles.p50[i] - 273.15,
      p75: percentiles.p75[i] - 273.15,
      p90: percentiles.p90[i] - 273.15,
    }));
  }, [percentiles]);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
        No percentile data available
      </div>
    );
  }

  return (
    <div className="panel p-4" role="figure" aria-label="Climatological percentile bands">
      <h3 className="text-sm font-semibold text-white mb-4">
        Climatological Range (1991-2020)
      </h3>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              stroke="#475569"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(value) => `${value.toFixed(0)}°C`}
              stroke="#475569"
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />

            {/* 10th-90th percentile band */}
            <Area
              dataKey="p90"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.1}
              name="90th percentile"
            />
            <Area
              dataKey="p10"
              stroke="none"
              fill="#0f172a"
              fillOpacity={1}
              name="10th percentile"
            />

            {/* 25th-75th percentile band */}
            <Area
              dataKey="p75"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.2}
              name="75th percentile"
            />
            <Area
              dataKey="p25"
              stroke="none"
              fill="#0f172a"
              fillOpacity={1}
              name="25th percentile"
            />

            {/* Median line */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Median"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500/10 border border-blue-500/30 rounded" />
          <span>10th-90th</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500/20 border border-blue-500/40 rounded" />
          <span>25th-75th</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-0.5 bg-blue-500 rounded" />
          <span>Median</span>
        </div>
      </div>
    </div>
  );
}
