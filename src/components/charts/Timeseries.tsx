/**
 * Timeseries chart component using Recharts.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useTimeseries, useTrend } from '../../hooks/useTimeseries';
import { useDataStore } from '../../stores/dataStore';
import { formatValueForScreenReader, formatCoordinatesForScreenReader } from '../../utils/accessibility';

interface TimeseriesProps {
  lat: number;
  lon: number;
  onClose: () => void;
}

export function Timeseries({ lat, lon, onClose }: TimeseriesProps) {
  const { selectedDatasetId } = useDataStore();
  const { data: timeseries, isLoading, error } = useTimeseries(selectedDatasetId, lat, lon);
  const { data: trend } = useTrend(selectedDatasetId, lat, lon);

  // Transform data for Recharts
  const chartData = timeseries?.times.map((time, i) => ({
    time,
    value: timeseries.values[i],
    valueCelsius: timeseries.values[i] - 273.15,
  })) || [];

  return (
    <div
      className="panel p-4"
      role="region"
      aria-label={`Timeseries chart for ${formatCoordinatesForScreenReader(lat, lon)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Point Timeseries</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {lat.toFixed(2)}°, {lon.toFixed(2)}°
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Close timeseries panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="h-48 flex items-center justify-center text-red-400 text-sm">
          Failed to load data
        </div>
      )}

      {/* Chart */}
      {!isLoading && !error && chartData.length > 0 && (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(value) => value.slice(5, 7)} // Show month
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
                  formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperature']}
                />
                <Line
                  type="monotone"
                  dataKey="valueCelsius"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
                {/* Trend line */}
                {trend?.significant && (
                  <ReferenceLine
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    label={{
                      value: 'Trend',
                      position: 'insideTopRight',
                      fill: '#ef4444',
                      fontSize: 10,
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trend info */}
          {trend && (
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Trend:</span>
                <span
                  className={`text-xs font-medium ${
                    trend.slope > 0 ? 'text-red-400' : 'text-blue-400'
                  }`}
                >
                  {trend.slope > 0 ? '+' : ''}
                  {(trend.slope * 10).toFixed(2)} °C/decade
                </span>
                {trend.significant && (
                  <span className="text-xs text-green-400">(significant)</span>
                )}
              </div>
            </div>
          )}

          {/* Screen reader summary */}
          <div className="sr-only">
            Temperature timeseries showing {chartData.length} data points.
            {trend && (
              <>
                Linear trend: {formatValueForScreenReader(trend.slope * 10, 'degrees Celsius per decade')}.
                {trend.significant ? ' This trend is statistically significant.' : ''}
              </>
            )}
          </div>
        </>
      )}

      {/* No data state */}
      {!isLoading && !error && chartData.length === 0 && (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No data available for this location
        </div>
      )}
    </div>
  );
}
