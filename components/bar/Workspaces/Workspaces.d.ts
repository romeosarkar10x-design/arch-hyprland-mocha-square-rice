import * as React from 'react';

/**
 * Workspaces — from hyprland-ui@0.1.0.
 */
export interface WorkspacesProps {
  workspaces: Workspace[];
  /** Focused workspace id. */
  active: number;
  onSelect?: (id: number) => void;
  /** Show app icons after the number. */
  showApps?: boolean;
  className?: string;
}

export declare const Workspaces: React.ComponentType<WorkspacesProps>;
