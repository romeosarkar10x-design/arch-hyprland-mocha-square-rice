import * as React from 'react';

/**
 * IconTile — from hyprland-ui@0.1.0.
 */
export interface IconTileProps {
  icon: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Tile edge in px. */
  size?: number;
  className?: string;
}

export declare const IconTile: React.ComponentType<IconTileProps>;
