import * as React from 'react';

/**
 * IconButton — from hyprland-ui@0.1.0.
 */
export interface IconButtonProps {
  icon: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Accessible name (also used as the native tooltip). */
  label: string;
  /** sm = 26px, md = 32px, lg = 44px. */
  size?: "sm" | "md" | "lg";
  /** primary fills with the accent; plain is transparent until hover. */
  variant?: "plain" | "primary" | "outline";
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Pressed / on state for toggles like shuffle or mute. */
  active?: boolean;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export declare const IconButton: React.ComponentType<IconButtonProps>;
