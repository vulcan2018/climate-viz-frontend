/**
 * Accessibility utilities for WCAG 2.1 AA compliance.
 */

/**
 * Announce a message to screen readers using ARIA live region.
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Format a value for screen reader announcement.
 */
export function formatValueForScreenReader(
  value: number,
  units: string,
  precision: number = 1
): string {
  const formattedValue = value.toFixed(precision);

  // Convert common units to spoken form
  const spokenUnits = units
    .replace('°C', 'degrees Celsius')
    .replace('°F', 'degrees Fahrenheit')
    .replace('K', 'Kelvin')
    .replace('mm', 'millimeters')
    .replace('m/s', 'meters per second')
    .replace('%', 'percent');

  return `${formattedValue} ${spokenUnits}`;
}

/**
 * Format coordinates for screen reader.
 */
export function formatCoordinatesForScreenReader(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'North' : 'South';
  const lonDir = lon >= 0 ? 'East' : 'West';

  return `${Math.abs(lat).toFixed(2)} degrees ${latDir}, ${Math.abs(lon).toFixed(2)} degrees ${lonDir}`;
}

/**
 * Generate unique ID for ARIA relationships.
 */
let idCounter = 0;
export function generateId(prefix: string = 'climate'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Check if user prefers reduced motion.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast.
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Trap focus within an element (for modals/dialogs).
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  firstFocusable?.focus();

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Keyboard navigation helpers.
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Handle keyboard activation (Enter or Space).
 */
export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: () => void
): void {
  if (event.key === KeyboardKeys.ENTER || event.key === KeyboardKeys.SPACE) {
    event.preventDefault();
    callback();
  }
}
