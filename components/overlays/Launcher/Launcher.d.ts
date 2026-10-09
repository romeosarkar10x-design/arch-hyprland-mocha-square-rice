import * as React from 'react';

/**
 * Launcher — from hyprland-ui@0.1.0.
 */
export interface LauncherProps {
  items?: LauncherItem[];
  /** Initial query. */
  query?: string;
  placeholder?: string;
  /** Fires with the chosen item on Enter or click. */
  onLaunch?: (item: LauncherItem) => void;
  onClose?: () => void;
  /** Focus the input on mount. */
  autoFocus?: boolean;
  width?: number;
  className?: string;
}

export declare const Launcher: React.ComponentType<LauncherProps>;
