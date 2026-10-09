import * as React from 'react';

/**
 * Meter — from hyprland-ui@0.1.0.
 */
export interface MeterProps {
  /** 0–100 fill. */
  value: number;
  /** Left caption, e.g. "VRAM". */
  label?: React.ReactNode;
  /** Right readout; defaults to the rounded percent. */
  readout?: React.ReactNode;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Number of cells. */
  cells?: number;
  /** Optional peak marker (0–100), drawn as a bright cell. */
  peak?: number;
  /** Colour by level (yellow at 60, red at 90). Turn off for things like fan speed. */
  levels?: boolean;
  /** Cell height in px. */
  height?: number;
  className?: string;
}

export declare const Meter: React.ComponentType<MeterProps>;
