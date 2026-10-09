import * as React from 'react';

/**
 * PanelSection — from hyprland-ui@0.1.0.
 */
export interface PanelSectionProps {
  /** Small caps label at the top-left. */
  label?: React.ReactNode;
  /** Right side of the label row, e.g. a figure or a toggle. */
  aside?: React.ReactNode;
  children?: React.ReactNode;
  /** Remove the inner padding (for edge-to-edge content). */
  flush?: boolean;
  className?: string;
}

export declare const PanelSection: React.ComponentType<PanelSectionProps>;
