# Climate Data Visualisation Frontend

React/TypeScript interactive climate data visualisation with 3D globe, 2D maps, and timeseries charts.

## Features

- **3D Globe**: CesiumJS landing view with global climate data overlay
- **2D Map Layers**: Deck.gl GPU-accelerated rendering with multiple projections
- **Timeseries Charts**: Recharts-based point timeseries with trend analysis
- **Temporal Controls**: Play/pause animation across time periods
- **Colormaps**: Selectable colour scales including colour-blind safe options
- **Regional Analysis**: Draw area of interest polygons, compute regional statistics
- **Accessibility**: WCAG 2.1 AA compliance (keyboard navigation, ARIA labels, screen reader support)
- **Responsive Design**: Desktop, tablet, and mobile layouts

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

## Technologies

| Technology | Version | Role |
|-----------|---------|------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| CesiumJS | 1.x | 3D globe rendering |
| Deck.gl | 8.x | GPU-accelerated 2D maps |
| Recharts | 2.x | Timeseries charts |
| Zustand | 4.x | State management |
| React Query | 5.x | Server state / caching |
| TailwindCSS | 3.x | Styling |
| Vite | 5.x | Build tool |
| Vitest | 1.x | Unit testing |
| Playwright | 1.x | E2E testing |

## Project Structure

```
climate-viz-frontend/
├── src/
│   ├── components/
│   │   ├── globe/          # CesiumJS 3D globe
│   │   ├── map/            # Deck.gl 2D map
│   │   ├── charts/         # Recharts visualizations
│   │   ├── controls/       # Timeline, colormap, etc.
│   │   └── layout/         # Header, Sidebar
│   ├── hooks/              # React Query data fetching
│   ├── stores/             # Zustand state management
│   ├── types/              # TypeScript definitions
│   └── utils/              # Colormaps, projections, a11y
├── tests/
│   ├── components/         # Unit tests
│   └── e2e/                # Playwright E2E tests
├── public/
│   └── sample-data/        # Sample JSON for demo
└── docs/
    ├── accessibility.md    # WCAG compliance guide
    └── component-guide.md  # Component documentation
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://climate-data-pipeline.vercel.app
VITE_CESIUM_TOKEN=your_cesium_ion_token
```

## API Integration

This frontend connects to the [Climate Data Pipeline API](https://github.com/vulcan2018/climate-data-pipeline):

- `/api/v1/data/datasets` - List available datasets
- `/api/v1/data/datasets/{id}/point` - Point timeseries
- `/api/v1/metrics/trend/{id}` - Trend analysis
- `/api/v1/metrics/percentiles/{id}` - Percentile thresholds

## Accessibility

- Keyboard navigation for all features
- Screen reader support with ARIA labels
- Colour-blind safe colormaps
- Respects reduced motion preferences
- Skip link for keyboard users

See [docs/accessibility.md](docs/accessibility.md) for details.

## License

MIT License - see LICENSE file.

## Author

S. Kalogerakos - FIRA Software Ltd
