import * as React from 'react';

/**
 * BarSegment — from hyprland-ui@0.1.0.
 */
export interface BarSegmentProps {
  icon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Main readout, e.g. "12%". */
  children?: React.ReactNode;
  /** Text colour of the whole segment. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** warn turns the text yellow; crit floods the segment red. */
  level?: "ok" | "warn" | "crit";
  /** Recent samples, drawn as a tiny bar sparkline after the readout. */
  spark?: number[];
  /** Draw the 1px divider on the left (right-hand modules use this). */
  divider?: boolean;
  /** Popup for this segment is open: surface fill and a 2px accent strip on top. */
  open?: boolean;
  /** Solid block variants for the launcher (mauve) and power (red) ends. */
  variant?: "clock" | "power" | "plain" | "launcher" | "title" | "media";
  /** Visually dim (e.g. muted audio, paused media). */
  dim?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  label?: string;
  className?: string;
}

export declare const BarSegment: React.ComponentType<BarSegmentProps>;
