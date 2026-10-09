import * as React from 'react';

/**
 * CoreGrid — from hyprland-ui@0.1.0.
 */
export interface CoreGridProps {
  /** Per-thread usage, 0–100. */
  cores: number[];
  /** Cells per row. */
  columns?: number;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  className?: string;
}

export declare const CoreGrid: React.ComponentType<CoreGridProps>;
