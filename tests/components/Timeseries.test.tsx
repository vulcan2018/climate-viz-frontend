/**
 * Tests for Timeseries component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Timeseries } from '../../src/components/charts/Timeseries';

// Mock the hooks
vi.mock('../../src/hooks/useTimeseries', () => ({
  useTimeseries: () => ({
    data: {
      times: ['2020-01-01', '2020-02-01', '2020-03-01'],
      values: [280.5, 282.3, 285.1],
      units: 'K',
      variable: '2m_temperature',
      location: { lat: 51.5, lon: -0.1 },
    },
    isLoading: false,
    error: null,
  }),
  useTrend: () => ({
    data: {
      slope: 0.023,
      slopeUnits: 'K per year',
      pValue: 0.001,
      significant: true,
      confidenceInterval: { lower: 0.018, upper: 0.028 },
      period: { start: 1980, end: 2023 },
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../../src/stores/dataStore', () => ({
  useDataStore: () => ({
    selectedDatasetId: 'era5-t2m',
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Timeseries', () => {
  it('renders the chart with data', () => {
    render(
      <Timeseries lat={51.5} lon={-0.1} onClose={() => {}} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Point Timeseries')).toBeInTheDocument();
    expect(screen.getByText(/51\.50°, -0\.10°/)).toBeInTheDocument();
  });

  it('shows trend information when significant', () => {
    render(
      <Timeseries lat={51.5} lon={-0.1} onClose={() => {}} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Trend:')).toBeInTheDocument();
    expect(screen.getByText('(significant)')).toBeInTheDocument();
  });

  it('has accessible close button', () => {
    const onClose = vi.fn();
    render(
      <Timeseries lat={51.5} lon={-0.1} onClose={onClose} />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });
});
