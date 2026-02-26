/**
 * Sidebar with layer controls, data selection, and analysis tools.
 * Migrated to Mantine UI per ECMWF requirements.
 */

import { Box, Flex, Tabs, Text, Title, Card, Stack, Button, ActionIcon, ScrollArea, Loader } from '@mantine/core';
import { useUIStore } from '../../stores/uiStore';
import { useDataStore } from '../../stores/dataStore';
import { useDatasets } from '../../hooks/useClimateData';
import { ColormapSelector } from '../controls/ColormapSelector';
import { ValueRange } from '../controls/ValueRange';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { sidebarTab, setSidebarTab } = useUIStore();
  const { selectedDatasetId, selectDataset } = useDataStore();
  const { data: datasets, isLoading } = useDatasets();

  return (
    <>
      {/* Toggle button */}
      <ActionIcon
        variant="filled"
        color="dark.7"
        size="lg"
        pos="absolute"
        top={80}
        left={0}
        style={{ zIndex: 20, borderRadius: '0 8px 8px 0' }}
        onClick={onToggle}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isOpen}
      >
        <svg
          style={{
            width: 20,
            height: 20,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s'
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </ActionIcon>

      {/* Sidebar panel */}
      <Box
        component="aside"
        bg="dark.9"
        w={isOpen ? 320 : 0}
        style={{
          flexShrink: 0,
          transition: 'width 0.3s',
          overflow: 'hidden',
          borderRight: isOpen ? '1px solid var(--mantine-color-dark-6)' : 'none'
        }}
        role="complementary"
        aria-label="Controls panel"
      >
        <Flex direction="column" h="100%">
          {/* Tabs */}
          <Tabs value={sidebarTab} onChange={(v) => setSidebarTab(v as 'layers' | 'data' | 'analysis')}>
            <Tabs.List>
              <Tabs.Tab value="layers" style={{ flex: 1 }}>Layers</Tabs.Tab>
              <Tabs.Tab value="data" style={{ flex: 1 }}>Data</Tabs.Tab>
              <Tabs.Tab value="analysis" style={{ flex: 1 }}>Analysis</Tabs.Tab>
            </Tabs.List>

            <ScrollArea flex={1} p="md" className="scrollbar-thin">
              <Tabs.Panel value="layers">
                <Title order={6} c="dimmed" mb="sm">
                  Visualization Settings
                </Title>
                <Stack gap="lg">
                  <ColormapSelector />
                  <ValueRange />
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="data">
                <Title order={6} c="dimmed" mb="sm">
                  Select Dataset
                </Title>
                {isLoading ? (
                  <Flex justify="center" py="md">
                    <Loader size="sm" />
                  </Flex>
                ) : (
                  <Stack gap="xs">
                    {datasets?.map((dataset) => (
                      <Button
                        key={dataset.id}
                        variant={selectedDatasetId === dataset.id ? 'filled' : 'subtle'}
                        color={selectedDatasetId === dataset.id ? 'blue' : 'gray'}
                        fullWidth
                        styles={{
                          root: { height: 'auto', padding: '12px' },
                          inner: { flexDirection: 'column', alignItems: 'flex-start' }
                        }}
                        onClick={() => selectDataset(dataset.id)}
                        aria-pressed={selectedDatasetId === dataset.id}
                      >
                        <Text fw={500}>{dataset.name}</Text>
                        <Text size="xs" c={selectedDatasetId === dataset.id ? 'white' : 'dimmed'}>
                          {dataset.variable} ({dataset.units})
                        </Text>
                      </Button>
                    ))}
                  </Stack>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="analysis">
                <Title order={6} c="dimmed" mb="sm">
                  Analysis Tools
                </Title>
                <Stack gap="sm">
                  <Card bg="dark.7" padding="md" radius="md">
                    <Title order={6} c="white" mb="xs">Point Analysis</Title>
                    <Text size="sm" c="dimmed">
                      Click on the map to select a point and view its timeseries.
                    </Text>
                  </Card>

                  <Card bg="dark.7" padding="md" radius="md">
                    <Title order={6} c="white" mb="xs">Regional Statistics</Title>
                    <Text size="sm" c="dimmed">
                      Draw a region to compute spatial statistics.
                    </Text>
                  </Card>

                  <Card bg="dark.7" padding="md" radius="md">
                    <Title order={6} c="white" mb="xs">Trend Analysis</Title>
                    <Text size="sm" c="dimmed">
                      Compute linear trends with statistical significance.
                    </Text>
                  </Card>
                </Stack>
              </Tabs.Panel>
            </ScrollArea>
          </Tabs>

          {/* Footer */}
          <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}>
            <Text size="xs" c="dimmed">Data: ERA5 Reanalysis</Text>
            <Text size="xs" c="dimmed">Built by FIRA Software Ltd</Text>
          </Box>
        </Flex>
      </Box>
    </>
  );
}
