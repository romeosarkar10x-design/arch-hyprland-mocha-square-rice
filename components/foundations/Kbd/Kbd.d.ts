import * as React from 'react';

/**
 * Kbd — from hyprland-ui@0.1.0.
 */
export interface KbdProps {
  /** Key label, e.g. "SUPER", "↵", "Esc". */
  children: React.ReactNode;
  className?: string;
}

export declare const Kbd: React.ComponentType<KbdProps>;
