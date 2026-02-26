/**
 * Timeline slider for temporal animation control.
 * Migrated to Mantine UI per ECMWF requirements (#39 - Slider component).
 */

import { useCallback, useEffect, useRef } from 'react';
import { Flex, Paper, Text, ActionIcon, Slider, SegmentedControl, Group } from '@mantine/core';
import { useMapStore } from '../../stores/mapStore';
import { useUIStore } from '../../stores/uiStore';

export function TimelineSlider() {
  const { animation, setAnimationState, play, pause, setCurrentTime } = useMapStore();
  const { reduceMotion } = useUIStore();
  const intervalRef = useRef<number | null>(null);

  // Parse dates
  const startDate = new Date(animation.startTime);
  const endDate = new Date(animation.endTime);
  const currentDate = new Date(animation.currentTime);

  // Calculate progress
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const currentDays = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const progress = (currentDays / totalDays) * 100;

  // Animation loop
  useEffect(() => {
    if (animation.playing && !reduceMotion) {
      intervalRef.current = window.setInterval(() => {
        const current = new Date(animation.currentTime);
        const next = new Date(current);
        next.setMonth(next.getMonth() + 1); // Advance by 1 month

        if (next > endDate) {
          // Loop back to start
          setCurrentTime(animation.startTime);
        } else {
          setCurrentTime(next.toISOString().split('T')[0]);
        }
      }, 1000 / animation.speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [animation.playing, animation.currentTime, animation.speed, reduceMotion, endDate, setCurrentTime, animation.startTime]);

  // Handle slider change
  const handleSliderChange = useCallback(
    (value: number) => {
      const days = (value / 100) * totalDays;
      const newDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
      setCurrentTime(newDate.toISOString().split('T')[0]);
    },
    [totalDays, startDate, setCurrentTime]
  );

  // Handle speed change
  const handleSpeedChange = useCallback(
    (speed: string) => {
      setAnimationState({ speed: parseInt(speed, 10) });
    },
    [setAnimationState]
  );

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  return (
    <Paper
      bg="dark.7"
      p="md"
      radius="md"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(37, 38, 43, 0.9)',
        border: '1px solid var(--mantine-color-dark-5)'
      }}
      role="group"
      aria-label="Timeline controls"
    >
      <Flex align="center" gap="md">
        {/* Play/Pause button */}
        <ActionIcon
          variant="filled"
          color="dark.5"
          size="lg"
          onClick={() => (animation.playing ? pause() : play())}
          aria-label={animation.playing ? 'Pause animation' : 'Play animation'}
        >
          {animation.playing ? (
            <svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </ActionIcon>

        {/* Timeline slider */}
        <Flex direction="column" flex={1} gap={4}>
          <Flex justify="space-between" align="center">
            <Text size="xs" c="dimmed">{formatDate(animation.startTime)}</Text>
            <Text size="xs" c="white" fw={500}>{formatDate(animation.currentTime)}</Text>
            <Text size="xs" c="dimmed">{formatDate(animation.endTime)}</Text>
          </Flex>
          <Slider
            value={progress}
            onChange={handleSliderChange}
            min={0}
            max={100}
            step={0.1}
            size="sm"
            label={formatDate(animation.currentTime)}
            aria-label="Timeline position"
            styles={{
              track: { backgroundColor: 'var(--mantine-color-dark-5)' },
              bar: { backgroundColor: 'var(--mantine-color-blue-6)' },
              thumb: {
                backgroundColor: 'var(--mantine-color-blue-6)',
                borderColor: 'var(--mantine-color-blue-6)'
              }
            }}
          />
        </Flex>

        {/* Speed control */}
        <Group gap="xs">
          <Text size="xs" c="dimmed">Speed:</Text>
          <SegmentedControl
            value={String(animation.speed)}
            onChange={handleSpeedChange}
            size="xs"
            data={[
              { label: '1x', value: '1' },
              { label: '2x', value: '2' },
              { label: '4x', value: '4' },
            ]}
          />
        </Group>
      </Flex>
    </Paper>
  );
}
