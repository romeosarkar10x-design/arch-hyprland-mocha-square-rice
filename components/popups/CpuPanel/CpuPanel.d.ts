import * as React from 'react';

/**
 * CpuPanel — from hyprland-ui@0.1.0.
 */
export interface CpuPanelProps {
  /** Live stats. Omit to run on the built-in simulation. */
  data?: CpuStats;
  /** Freeze the simulation (ignored when `data` is passed). */
  paused?: boolean;
  onOpenMonitor?: () => void;
  className?: string;
}

export declare const CpuPanel: React.ComponentType<CpuPanelProps>;
