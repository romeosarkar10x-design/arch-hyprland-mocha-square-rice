import * as React from 'react';

/**
 * Graph — from hyprland-ui@0.1.0.
 */
export interface GraphProps {
  series: GraphSeries[];
  /** Fixed full scale. Omit to auto-scale to the largest sample. */
  max?: number;
  /** Total sample slots across the width (history length). */
  capacity?: number;
  height?: number;
  /** Formats values in the hover readout and the scale label. */
  format?: (value: number) => string;
  /** Horizontal grid lines. */
  gridLines?: number;
  /** "area" fills under the line; "bars" draws one column per sample. */
  kind?: "area" | "bars";
  className?: string;
}

export declare const Graph: React.ComponentType<GraphProps>;
