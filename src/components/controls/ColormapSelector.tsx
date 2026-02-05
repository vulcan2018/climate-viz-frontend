/**
 * Colormap selector component.
 */

import { useState, useRef, useEffect } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { COLORMAPS } from '../../utils/colormaps';

export function ColormapSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { colormap, setColormap } = useDataStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      <label className="label">Colormap</label>

      <div className="relative" ref={menuRef}>
        <button
          className="w-full input flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center gap-2">
            {/* Color preview */}
            <div
              className="w-16 h-4 rounded"
              style={{
                background: `linear-gradient(to right, ${colormap.colors.join(', ')})`,
              }}
            />
            <span className="text-sm">{colormap.name}</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1 panel py-1 z-10 max-h-64 overflow-y-auto scrollbar-thin"
            role="listbox"
            aria-label="Select colormap"
          >
            {COLORMAPS.map((cmap) => (
              <button
                key={cmap.id}
                className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                  colormap.id === cmap.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                onClick={() => {
                  setColormap(cmap);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={colormap.id === cmap.id}
              >
                {/* Color preview */}
                <div
                  className="w-20 h-4 rounded flex-shrink-0"
                  style={{
                    background: `linear-gradient(to right, ${cmap.colors.join(', ')})`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{cmap.name}</div>
                  {cmap.colorBlindSafe && (
                    <div className="text-xs text-green-400">Color-blind safe</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
