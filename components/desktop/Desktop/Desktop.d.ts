import * as React from 'react';

/**
 * Desktop — from hyprland-ui@0.1.0.
 */
export interface DesktopProps {
  /** Workspace shown first. */
  workspace?: number;
  /** Popup open on load: cpu, gpu, mem, net, audio, clock, qs, media, power or launcher. */
  openPopup?: "clock" | "cpu" | "gpu" | "power" | "launcher" | "media" | "mem" | "net" | "audio" | "qs";
  /** Show demo notifications a few seconds after load. */
  notifications?: boolean;
  /** Freeze live data (for screenshots). */
  paused?: boolean;
  /** Wallpaper variant. */
  wallpaper?: "image" | "aurora" | "tiles";
  width?: string | number;
  height?: string | number;
  className?: string;
}

export declare const Desktop: React.ComponentType<DesktopProps>;
