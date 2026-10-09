import * as React from 'react';

/**
 * Terminal — from hyprland-ui@0.1.0.
 */
export interface TerminalProps {
  lines?: TerminalLine[];
  /** Working directory shown in the prompt. */
  cwd?: string;
  /** Show the blinking block cursor on a final empty prompt. */
  cursor?: boolean;
  className?: string;
}

export declare const Terminal: React.ComponentType<TerminalProps>;
