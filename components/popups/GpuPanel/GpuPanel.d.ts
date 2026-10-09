import * as React from 'react';

/**
 * GpuPanel — from hyprland-ui@0.1.0.
 */
export interface GpuPanelProps {
  data?: GpuStats;
  paused?: boolean;
  onOpenMonitor?: () => void;
  className?: string;
}

export declare const GpuPanel: React.ComponentType<GpuPanelProps>;
