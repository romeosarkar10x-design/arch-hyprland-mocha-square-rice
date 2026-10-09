import * as React from 'react';

/**
 * WindowFrame — from hyprland-ui@0.1.0.
 */
export interface WindowFrameProps {
  /** Focused windows get the animated mauve → pink → yellow border and the drop shadow. */
  focused?: boolean;
  /** Small class label on the bottom-right corner (dev aid, like hyprctl clients). */
  tag?: string;
  children?: React.ReactNode;
  onFocus?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export declare const WindowFrame: React.ComponentType<WindowFrameProps>;
