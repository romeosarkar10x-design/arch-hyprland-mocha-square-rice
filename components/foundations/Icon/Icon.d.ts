import * as React from 'react';

/**
 * Icon — from hyprland-ui@0.1.0.
 */
export interface IconProps {
  /** Icon to draw, from the `icons` table. */
  name: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Size in px or any CSS length. Defaults to 1em so it follows the surrounding font size. */
  size?: string | number;
  /** CSS colour. Defaults to currentColor. */
  color?: string;
  /** Accessible label; when omitted the icon is decorative (aria-hidden). */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Icon: React.ComponentType<IconProps>;
