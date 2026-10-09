import * as React from 'react';

/**
 * Wallpaper — from hyprland-ui@0.1.0.
 */
export interface WallpaperProps {
  /** aurora = soft mauve/blue glows over a square grid; tiles = dwindle blocks; image = `src`. */
  variant?: "image" | "aurora" | "tiles";
  src?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Wallpaper: React.ComponentType<WallpaperProps>;
