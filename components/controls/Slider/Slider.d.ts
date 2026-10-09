import * as React from 'react';

/**
 * Slider — from hyprland-ui@0.1.0.
 * @replaces input[type=range]
 */
export interface SliderProps {
  /** Controlled value 0–max. Omit to use `defaultValue`. */
  value?: number;
  defaultValue?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Icon at the left end (click target for e.g. mute). */
  icon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  onIconClick?: () => void;
  /** Show the value at the right end, e.g. "64%". */
  showValue?: boolean;
  /** Formats the value readout. */
  format?: (value: number) => string;
  /** Number of tick marks under the track (0 for none). */
  ticks?: number;
  /** Greys the fill, e.g. while muted. */
  muted?: boolean;
  label?: string;
  className?: string;
}

export declare const Slider: React.ComponentType<SliderProps>;
