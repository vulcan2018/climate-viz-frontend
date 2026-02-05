/**
 * Timeline slider for temporal animation control.
 */

import { useCallback, useEffect, useRef } from 'react';
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      const days = (value / 100) * totalDays;
      const newDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
      setCurrentTime(newDate.toISOString().split('T')[0]);
    },
    [totalDays, startDate, setCurrentTime]
  );

  // Handle speed change
  const handleSpeedChange = useCallback(
    (speed: number) => {
      setAnimationState({ speed });
    },
    [setAnimationState]
  );

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  return (
    <div
      className="panel p-4"
      role="group"
      aria-label="Timeline controls"
    >
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          className="btn btn-secondary p-2"
          onClick={() => (animation.playing ? pause() : play())}
          aria-label={animation.playing ? 'Pause animation' : 'Play animation'}
        >
          {animation.playing ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Timeline slider */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{formatDate(animation.startTime)}</span>
            <span className="font-medium text-white">{formatDate(animation.currentTime)}</span>
            <span>{formatDate(animation.endTime)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            aria-label="Timeline position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-valuetext={formatDate(animation.currentTime)}
          />
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">Speed:</span>
          {[1, 2, 4].map((speed) => (
            <button
              key={speed}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                animation.speed === speed
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => handleSpeedChange(speed)}
              aria-label={`Set speed to ${speed}x`}
              aria-pressed={animation.speed === speed}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
