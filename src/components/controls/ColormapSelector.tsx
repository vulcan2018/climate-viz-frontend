/**
 * Colormap selector component.
 * Migrated to Mantine UI per ECMWF requirements.
 */

import { Box, Text, Select, Stack, Group, Badge } from '@mantine/core';
import { useDataStore } from '../../stores/dataStore';
import { COLORMAPS, Colormap } from '../../utils/colormaps';

export function ColormapSelector() {
  const { colormap, setColormap } = useDataStore();

  // Custom option renderer
  const renderOption = ({ option }: { option: { value: string; label: string } }) => {
    const cmap = COLORMAPS.find(c => c.id === option.value);
    if (!cmap) return option.label;

    return (
      <Group gap="sm" wrap="nowrap">
        <Box
          w={64}
          h={16}
          style={{
            background: `linear-gradient(to right, ${cmap.colors.join(', ')})`,
            borderRadius: 4,
            flexShrink: 0,
          }}
        />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" truncate>{cmap.name}</Text>
          {cmap.colorBlindSafe && (
            <Badge size="xs" color="green" variant="light">Color-blind safe</Badge>
          )}
        </Box>
      </Group>
    );
  };

  return (
    <Stack gap="xs">
      <Text size="sm" c="dimmed" fw={500}>Colormap</Text>

      {/* Current selection preview */}
      <Box
        p="xs"
        bg="dark.7"
        style={{ borderRadius: 8 }}
      >
        <Group gap="sm" wrap="nowrap">
          <Box
            w={64}
            h={16}
            style={{
              background: `linear-gradient(to right, ${colormap.colors.join(', ')})`,
              borderRadius: 4,
            }}
          />
          <Text size="sm">{colormap.name}</Text>
        </Group>
      </Box>

      <Select
        data={COLORMAPS.map((cmap) => ({
          value: cmap.id,
          label: cmap.name,
        }))}
        value={colormap.id}
        onChange={(value) => {
          const selected = COLORMAPS.find((c) => c.id === value);
          if (selected) setColormap(selected);
        }}
        placeholder="Select colormap"
        renderOption={renderOption}
        aria-label="Select colormap"
        styles={{
          dropdown: { maxHeight: 256 }
        }}
      />
    </Stack>
  );
}
