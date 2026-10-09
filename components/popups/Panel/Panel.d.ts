import * as React from 'react';

/**
 * Panel — from hyprland-ui@0.1.0.
 */
export interface PanelProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Drives the corner brackets, the icon tile and any child that reads --hx-acc. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Shows a pulsing LIVE marker in the header. */
  live?: boolean;
  /** Extra header content on the right (replaces the LIVE marker). */
  headerAside?: React.ReactNode;
  /** Footer action row (buttons). */
  actions?: React.ReactNode;
  /** Width in px. */
  width?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Panel: React.ComponentType<PanelProps>;
