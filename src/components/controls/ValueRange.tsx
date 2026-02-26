/**
 * Value range control for color scale.
 * Migrated to Mantine UI per ECMWF requirements.
 */

import { useState, useCallback } from 'react';
import { Box, Text, Group, Checkbox, NumberInput, Button, SimpleGrid, Stack, Flex } from '@mantine/core';
import { useDataStore } from '../../stores/dataStore';

export function ValueRange() {
  const { valueRange, setValueRange, colormap } = useDataStore();
  const [localMin, setLocalMin] = useState<number | string>(valueRange.min);
  const [localMax, setLocalMax] = useState<number | string>(valueRange.max);

  const handleMinBlur = useCallback(() => {
    const value = typeof localMin === 'number' ? localMin : parseFloat(localMin);
    if (!isNaN(value) && value < valueRange.max) {
      setValueRange({ min: value, autoScale: false });
    } else {
      setLocalMin(valueRange.min);
    }
  }, [localMin, valueRange.max, valueRange.min, setValueRange]);

  const handleMaxBlur = useCallback(() => {
    const value = typeof localMax === 'number' ? localMax : parseFloat(localMax);
    if (!isNaN(value) && value > valueRange.min) {
      setValueRange({ max: value, autoScale: false });
    } else {
      setLocalMax(valueRange.max);
    }
  }, [localMax, valueRange.min, valueRange.max, setValueRange]);

  const handleAutoScale = useCallback(() => {
    setValueRange({ autoScale: !valueRange.autoScale });
    if (!valueRange.autoScale) {
      // Reset to default range when enabling auto-scale
      setValueRange({ min: 220, max: 320, autoScale: true });
      setLocalMin(220);
      setLocalMax(320);
    }
  }, [valueRange.autoScale, setValueRange]);

  // Convert Kelvin to Celsius for display
  const minCelsius = valueRange.min - 273.15;
  const maxCelsius = valueRange.max - 273.15;

  return (
    <Stack gap="sm">
      <Flex justify="space-between" align="center">
        <Text size="sm" c="dimmed" fw={500}>Value Range</Text>
        <Checkbox
          size="xs"
          label="Auto"
          checked={valueRange.autoScale}
          onChange={handleAutoScale}
        />
      </Flex>

      {/* Color bar preview */}
      <Box>
        <Box
          h={16}
          style={{
            background: `linear-gradient(to right, ${colormap.colors.join(', ')})`,
            borderRadius: 4,
          }}
        />
        <Flex justify="space-between" mt={4}>
          <Text size="xs" c="dimmed">{minCelsius.toFixed(0)}°C</Text>
          <Text size="xs" c="dimmed">{maxCelsius.toFixed(0)}°C</Text>
        </Flex>
      </Box>

      {/* Min/Max inputs */}
      <SimpleGrid cols={2} spacing="sm">
        <NumberInput
          label="Min (K)"
          size="xs"
          value={localMin}
          onChange={setLocalMin}
          onBlur={handleMinBlur}
          disabled={valueRange.autoScale}
          aria-label="Minimum value in Kelvin"
        />
        <NumberInput
          label="Max (K)"
          size="xs"
          value={localMax}
          onChange={setLocalMax}
          onBlur={handleMaxBlur}
          disabled={valueRange.autoScale}
          aria-label="Maximum value in Kelvin"
        />
      </SimpleGrid>

      {/* Quick presets */}
      <Group grow gap="xs">
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          onClick={() => {
            setValueRange({ min: 220, max: 320, autoScale: false });
            setLocalMin(220);
            setLocalMax(320);
          }}
          disabled={valueRange.autoScale}
        >
          Global
        </Button>
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          onClick={() => {
            setValueRange({ min: 260, max: 310, autoScale: false });
            setLocalMin(260);
            setLocalMax(310);
          }}
          disabled={valueRange.autoScale}
        >
          Temperate
        </Button>
      </Group>
    </Stack>
  );
}
