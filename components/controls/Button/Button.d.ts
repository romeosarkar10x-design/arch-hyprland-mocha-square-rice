import * as React from 'react';

/**
 * Button — from hyprland-ui@0.1.0.
 * @replaces button
 */
export interface ButtonProps {
  /** Filled (primary), plain surface (secondary), outline only (ghost) or red (danger). */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** sm = 26px, md = 32px, lg = 40px. */
  size?: "sm" | "md" | "lg";
  /** Accent colour token for the icon and hover fill. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Leading icon. */
  icon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Shortcut hint drawn as a keycap at the end. */
  kbd?: string;
  /** Stretch to the container width. */
  block?: boolean;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export declare const Button: React.ComponentType<ButtonProps>;
