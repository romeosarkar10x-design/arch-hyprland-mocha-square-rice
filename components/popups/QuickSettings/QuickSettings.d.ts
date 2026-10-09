import * as React from 'react';

/**
 * QuickSettings — from hyprland-ui@0.1.0.
 */
export interface QuickSettingsProps {
  tiles?: QuickTile[];
  /** Columns in the tile grid. */
  columns?: number;
  onToggle?: (id: string, on: boolean) => void;
  /** Render just the grid (no Panel chrome or sliders). */
  bare?: boolean;
  className?: string;
}

export declare const QuickSettings: React.ComponentType<QuickSettingsProps>;
