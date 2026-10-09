import * as React from 'react';

/**
 * BrowserView — from hyprland-ui@0.1.0.
 */
export interface BrowserViewProps {
  url?: string;
  tabs?: string[];
  className?: string;
}

export declare const BrowserView: React.ComponentType<BrowserViewProps>;
