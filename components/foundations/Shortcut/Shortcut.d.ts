import * as React from 'react';

/**
 * Shortcut — from hyprland-ui@0.1.0.
 */
export interface ShortcutProps {
  /** Keys pressed together, e.g. ["SUPER", "R"]. */
  keys: string[];
  className?: string;
}

export declare const Shortcut: React.ComponentType<ShortcutProps>;
