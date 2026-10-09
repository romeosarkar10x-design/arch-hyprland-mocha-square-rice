import * as React from 'react';

/**
 * Surface — from hyprland-ui@0.1.0.
 */
export interface SurfaceProps {
  /** Background: crust (screen), mantle (popup body), base (window body) or the aurora wallpaper. */
  tone?: "crust" | "mantle" | "base" | "wallpaper";
  /** Inner padding in px. */
  padding?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Surface: React.ComponentType<SurfaceProps>;
