/**
 * Timeseries chart component using Recharts.
 * Migrated to Mantine UI per ECMWF requirements.
 * Note: Recharts retained as per #39 clarification (Plotly for specific chart types).
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { Paper, Box, Text, Title, Flex, ActionIcon, Loader, Center, Badge, Divider } from '@mantine/core';
import { useTimeseries, useTrend } from '../../hooks/useTimeseries';
import { useDataStore } from '../../stores/dataStore';
import { useMapStore } from '../../stores/mapStore';
import { formatValueForScreenReader, formatCoordinatesForScreenReader } from '../../utils/accessibility';

interface TimeseriesProps {
  lat: number;
  lon: number;
  onClose: () => void;
}

export function Timeseries({ lat, lon, onClose }: TimeseriesProps) {
  const { selectedDatasetId, datasets } = useDataStore();
  const { animation } = useMapStore();

  // Get selected dataset info for units and variable name
  const selectedDataset = useMemo(() => {
    return datasets.find(d => d.id === selectedDatasetId);
  }, [datasets, selectedDatasetId]);

  // Get current year from animation for API query
  const currentYear = useMemo(() => {
    const date = new Date(animation.currentTime);
    return date.getFullYear();
  }, [animation.currentTime]);

  // Pass current year to API - data will change when year changes
  const startDate = `${currentYear}-01-01`;
  const { data: timeseries, isLoading, error } = useTimeseries(selectedDatasetId, lat, lon, startDate);
  const { data: trend } = useTrend(selectedDatasetId, lat, lon);

  // Get current month from animation
  const currentMonth = useMemo(() => {
    const date = new Date(animation.currentTime);
    return date.getMonth() + 1; // 1-12
  }, [animation.currentTime]);

  // Determine if we need to convert from Kelvin to Celsius
  const isTemperature = useMemo(() => {
    const units = timeseries?.units || selectedDataset?.units || '';
    return units.toLowerCase() === 'k' || units.toLowerCase() === 'kelvin';
  }, [timeseries, selectedDataset]);

  // Get display units
  const displayUnits = useMemo(() => {
    if (isTemperature) return '°C';
    return timeseries?.units || selectedDataset?.units || '';
  }, [isTemperature, timeseries, selectedDataset]);

  // Get variable name for display
  const variableName = useMemo(() => {
    return timeseries?.variable || selectedDataset?.name || 'Value';
  }, [timeseries, selectedDataset]);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!timeseries) return [];
    return timeseries.times.map((time, i) => ({
      time,
      month: new Date(time).getMonth() + 1,
      value: timeseries.values[i],
      displayValue: isTemperature ? timeseries.values[i] - 273.15 : timeseries.values[i],
    }));
  }, [timeseries, isTemperature]);

  // Find current value based on animation time
  const currentValue = useMemo(() => {
    const dataPoint = chartData.find(d => d.month === currentMonth);
    return dataPoint?.displayValue;
  }, [chartData, currentMonth]);

  // Find the x-axis value for current time
  const currentTimeX = useMemo(() => {
    const dataPoint = chartData.find(d => d.month === currentMonth);
    return dataPoint?.time;
  }, [chartData, currentMonth]);

  // Format month name
  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short' });
  };

  return (
    <Paper
      bg="dark.7"
      p="md"
      radius="md"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(37, 38, 43, 0.95)',
        border: '1px solid var(--mantine-color-dark-5)'
      }}
      role="region"
      aria-label={`Timeseries chart for ${formatCoordinatesForScreenReader(lat, lon)}`}
    >
      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb="sm">
        <Box>
          <Title order={6} c="white">Point Timeseries</Title>
          <Text size="xs" c="dimmed">
            {lat.toFixed(2)}°, {lon.toFixed(2)}°
          </Text>
        </Box>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={onClose}
          aria-label="Close timeseries panel"
        >
          <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </ActionIcon>
      </Flex>

      {/* Current value display */}
      {currentValue !== undefined && (
        <Paper bg="dark.6" p="xs" radius="sm" mb="sm">
          <Text size="xs" c="dimmed">
            {formatMonth(animation.currentTime)} {new Date(animation.currentTime).getFullYear()}
          </Text>
          <Text size="lg" fw={700} c="blue.4">
            {currentValue.toFixed(1)} {displayUnits}
          </Text>
        </Paper>
      )}

      {/* Loading state */}
      {isLoading && (
        <Center h={192}>
          <Loader color="blue" size="md" />
        </Center>
      )}

      {/* Error state */}
      {error && (
        <Center h={192}>
          <Text c="red.4" size="sm">Failed to load data</Text>
        </Center>
      )}

      {/* Chart */}
      {!isLoading && !error && chartData.length > 0 && (
        <>
          <Box h={192}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(value) => formatMonth(value)}
                  stroke="#475569"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(value) => `${value.toFixed(0)} ${displayUnits}`}
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
                  labelFormatter={(value) => formatMonth(value as string)}
                  formatter={(value: number) => [`${value.toFixed(1)} ${displayUnits}`, variableName]}
                />
                <Line
                  type="monotone"
                  dataKey="displayValue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
                {/* Current time reference line */}
                {currentTimeX && (
                  <ReferenceLine
                    x={currentTimeX}
                    stroke="#22c55e"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                )}
                {/* Current time dot */}
                {currentTimeX && currentValue !== undefined && (
                  <ReferenceDot
                    x={currentTimeX}
                    y={currentValue}
                    r={6}
                    fill="#22c55e"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* Trend info */}
          {trend && (
            <>
              <Divider my="sm" color="dark.5" />
              <Flex align="center" gap="xs">
                <Text size="xs" c="dimmed">Trend:</Text>
                <Text
                  size="xs"
                  fw={500}
                  c={trend.slope > 0 ? 'red.4' : 'blue.4'}
                >
                  {trend.slope > 0 ? '+' : ''}
                  {(trend.slope * 10).toFixed(2)} {displayUnits}/decade
                </Text>
                {trend.significant && (
                  <Badge size="xs" color="green" variant="light">significant</Badge>
                )}
              </Flex>
            </>
          )}

          {/* Screen reader summary */}
          <Box style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
            {variableName} timeseries showing {chartData.length} data points.
            Current value: {currentValue?.toFixed(1)} {displayUnits}.
            {trend && (
              <>
                Linear trend: {formatValueForScreenReader(trend.slope * 10, `${displayUnits} per decade`)}.
                {trend.significant ? ' This trend is statistically significant.' : ''}
              </>
            )}
          </Box>
        </>
      )}

      {/* No data state */}
      {!isLoading && !error && chartData.length === 0 && (
        <Center h={192}>
          <Text c="dimmed" size="sm">No data available for this location</Text>
        </Center>
      )}
    </Paper>
  );
}
