/**
 * Type declarations for Deck.gl packages.
 */

declare module '@deck.gl/react' {
  import { ComponentType } from 'react';

  interface DeckGLProps {
    viewState?: Record<string, unknown>;
    onViewStateChange?: (params: { viewState: unknown }) => void;
    controller?: boolean;
    layers?: unknown[];
    onClick?: (info: unknown) => void;
    getTooltip?: (info: unknown) => unknown;
    views?: unknown;
    children?: React.ReactNode;
  }

  const DeckGL: ComponentType<DeckGLProps>;
  export default DeckGL;
}

declare module '@deck.gl/layers' {
  export class BitmapLayer {
    constructor(props: Record<string, unknown>);
  }

  export class GeoJsonLayer {
    constructor(props: Record<string, unknown>);
  }
}

declare module '@deck.gl/core' {
  export class MapView {
    constructor(props?: Record<string, unknown>);
  }

  export interface PickingInfo {
    object?: unknown;
    coordinate?: [number, number];
    x?: number;
    y?: number;
  }
}
