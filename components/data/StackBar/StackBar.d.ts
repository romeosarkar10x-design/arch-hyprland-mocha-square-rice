import * as React from 'react';

/**
 * StackBar — from hyprland-ui@0.1.0.
 */
export interface StackBarProps {
  /** Parts of the whole, in any unit; the bar fills by their share of `total`. */
  segments: StackSegment[];
  /** Whole; the remainder is drawn as free space. */
  total: number;
  /** Formats each legend value. */
  format?: (value: number) => string;
  /** Hide the legend under the bar. */
  hideLegend?: boolean;
  className?: string;
}

export declare const StackBar: React.ComponentType<StackBarProps>;
