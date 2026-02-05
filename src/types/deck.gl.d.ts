/**
 * Type declarations for Deck.gl packages.
 */

declare module '@deck.gl/react' {
  import { ComponentType } from 'react';

  interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  }

  interface PickingInfo {
    object?: Record<string, unknown>;
    coordinate?: [number, number];
    x?: number;
    y?: number;
  }

  interface DeckGLProps {
    viewState?: ViewState;
    onViewStateChange?: (params: { viewState: ViewState }) => void;
    controller?: boolean;
    layers?: unknown[];
    onClick?: (info: PickingInfo) => void;
    getTooltip?: (info: PickingInfo) => { html: string } | null;
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
    object?: Record<string, unknown>;
    coordinate?: [number, number];
    x?: number;
    y?: number;
  }
}
