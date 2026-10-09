import * as React from 'react';

/**
 * Sparkline — from hyprland-ui@0.1.0.
 */
export interface SparklineProps {
  /** Oldest first. */
  data: number[];
  max?: number;
  /** Number of bars shown (most recent). */
  bars?: number;
  /** Bar height in px. */
  height?: number;
  className?: string;
}

export declare const Sparkline: React.ComponentType<SparklineProps>;
