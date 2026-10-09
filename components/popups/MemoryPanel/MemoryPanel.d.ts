import * as React from 'react';

/**
 * MemoryPanel — from hyprland-ui@0.1.0.
 */
export interface MemoryPanelProps {
  data?: MemStats;
  paused?: boolean;
  className?: string;
}

export declare const MemoryPanel: React.ComponentType<MemoryPanelProps>;
