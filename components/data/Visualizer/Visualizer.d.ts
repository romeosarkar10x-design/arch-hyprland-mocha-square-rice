import * as React from 'react';

/**
 * Visualizer — from hyprland-ui@0.1.0.
 */
export interface VisualizerProps {
  /** Bar heights 0–100 (e.g. cava output). Omit to run the built-in simulated spectrum. */
  bars?: number[];
  /** Number of bars when simulating. */
  count?: number;
  /** Simulated playback state; false settles to a flat line. */
  playing?: boolean;
  /** Height in px or any CSS length (e.g. "100%"). */
  height?: string | number;
  /** "bars" = square columns with peak caps; "mirror" = columns reflected around the middle. */
  variant?: "bars" | "mirror";
  /** Gradient from the bass end to the treble end. */
  from?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  to?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  className?: string;
}

export declare const Visualizer: React.ComponentType<VisualizerProps>;
