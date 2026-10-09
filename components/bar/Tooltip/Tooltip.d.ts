import * as React from 'react';

/**
 * Tooltip — from hyprland-ui@0.1.0.
 */
export interface TooltipProps {
  title: string;
  subtitle?: string;
  icon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Colour of the 3px top strip, title and inline bars. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  rows?: TooltipRow[];
  /** Mouse/keyboard hints in the footer, e.g. [["click", "btop"], ["scroll", "volume"]]. */
  hints?: [string, string][];
  children?: React.ReactNode;
  className?: string;
}

export declare const Tooltip: React.ComponentType<TooltipProps>;
