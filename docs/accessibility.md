# Accessibility Guide

This document describes the accessibility features implemented to meet WCAG 2.1 AA compliance.

## Keyboard Navigation

### Global Navigation
- **Tab**: Move focus to next interactive element
- **Shift+Tab**: Move focus to previous element
- **Enter/Space**: Activate focused button or control
- **Escape**: Close modal dialogs or dropdown menus

### Map Controls
- **Arrow keys**: Pan the map (2D) or rotate the globe (3D)
- **+/-**: Zoom in/out
- **Home**: Reset view to default position

### Timeline
- **Space**: Play/pause animation
- **Arrow Left/Right**: Step backward/forward in time

## Screen Reader Support

### ARIA Labels
All interactive elements have descriptive `aria-label` attributes:
- Buttons describe their action
- Controls describe their current state
- Regions are labeled for navigation

### Live Regions
Dynamic content updates are announced via ARIA live regions:
- Selected point coordinates
- Data loading states
- Error messages

### Skip Link
A "Skip to main content" link is provided for keyboard users to bypass navigation.

## Visual Accessibility

### Color Contrast
- All text meets WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)
- Interactive elements have visible focus indicators

### Color-Blind Safe Options
- Multiple colormap options with color-blind safe variants
- Viridis, Plasma, and Inferno are perceptually uniform
- Red-Blue diverging colormap is distinguishable for most color vision deficiencies

### Reduced Motion
- Animation can be disabled via the "Reduce motion" preference
- Respects system `prefers-reduced-motion` setting
- Timeline animation pauses when reduced motion is enabled

### High Contrast
- High contrast mode available for users who need it
- Respects system `prefers-contrast: more` setting

## Testing

### Automated Testing
- Axe accessibility testing in unit tests
- Lighthouse accessibility audits in CI

### Manual Testing
- Tested with NVDA (Windows)
- Tested with VoiceOver (macOS)
- Keyboard-only navigation verified

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
