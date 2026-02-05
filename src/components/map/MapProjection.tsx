/**
 * Map projection selector component.
 */

import { useState, useRef, useEffect } from 'react';
import { useMapStore } from '../../stores/mapStore';
import { AVAILABLE_PROJECTIONS, getProjectionName } from '../../utils/projections';
import type { ProjectionType } from '../../types/map';

export function MapProjection() {
  const [isOpen, setIsOpen] = useState(false);
  const { projection, setProjection } = useMapStore();
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

  const handleSelect = (proj: ProjectionType) => {
    setProjection(proj);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="panel px-3 py-2 flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Projection: ${getProjectionName(projection)}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
          />
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
        </svg>
        <span>{getProjectionName(projection)}</span>
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
          className="absolute top-full left-0 mt-1 panel py-1 min-w-[180px] z-10"
          role="listbox"
          aria-label="Select projection"
        >
          {AVAILABLE_PROJECTIONS.map((proj) => (
            <button
              key={proj.id}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                projection === proj.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              onClick={() => handleSelect(proj.id)}
              role="option"
              aria-selected={projection === proj.id}
            >
              {proj.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
