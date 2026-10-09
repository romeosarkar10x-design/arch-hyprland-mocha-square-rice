import * as React from 'react';

/**
 * PowerMenu — from hyprland-ui@0.1.0.
 */
export interface PowerMenuProps {
  actions?: PowerAction[];
  /** How long a destructive action must be held. */
  holdMs?: number;
  onAction?: (id: string) => void;
  /** Uptime / user line under the grid. */
  footer?: React.ReactNode;
  className?: string;
}

export declare const PowerMenu: React.ComponentType<PowerMenuProps>;
