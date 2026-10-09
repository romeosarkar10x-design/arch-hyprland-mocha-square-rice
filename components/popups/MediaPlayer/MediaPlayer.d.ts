import * as React from 'react';

/**
 * MediaPlayer — from hyprland-ui@0.1.0.
 */
export interface MediaPlayerProps {
  track: Track;
  /** Player name shown above the title, e.g. "Spotify". */
  player?: string;
  playerIcon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Controlled playback. Omit to let the player run itself. */
  playing?: boolean;
  /** Start position in seconds. */
  position?: number;
  onPlayPause?: (playing: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  /** compact = single row for the bar's centre dropdown. */
  variant?: "full" | "compact";
  className?: string;
}

export declare const MediaPlayer: React.ComponentType<MediaPlayerProps>;
