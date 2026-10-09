import * as React from 'react';

/**
 * Gauge — from hyprland-ui@0.1.0.
 */
export interface GaugeProps {
  /** Current value in the gauge's own unit. */
  value: number;
  /** Full-scale value. Defaults to 100. */
  max?: number;
  /** Caption under the number, e.g. "LOAD", "TEMP". */
  label: string;
  /** Unit after the number, e.g. "%", "°", "W". */
  unit?: string;
  /** Small line under the caption, e.g. "of 220 W". */
  sub?: React.ReactNode;
  /** Colour while below the warn threshold. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Thresholds as percentages of max. Defaults to 60 / 90. */
  warn?: number;
  crit?: number;
  /** Outer size in px. */
  size?: number;
  /** Number of segments around the 270° arc. */
  segments?: number;
  className?: string;
}

export declare const Gauge: React.ComponentType<GaugeProps>;
