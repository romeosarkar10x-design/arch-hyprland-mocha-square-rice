import * as React from 'react';

/**
 * Bar — from hyprland-ui@0.1.0.
 */
export interface BarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Bar: React.ComponentType<BarProps>;
