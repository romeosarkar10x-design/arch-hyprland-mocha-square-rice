import * as React from 'react';

/**
 * NetworkPanel — from hyprland-ui@0.1.0.
 */
export interface NetworkPanelProps {
  data?: NetStats;
  paused?: boolean;
  className?: string;
}

export declare const NetworkPanel: React.ComponentType<NetworkPanelProps>;
