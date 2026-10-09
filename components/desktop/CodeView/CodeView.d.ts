import * as React from 'react';

/**
 * CodeView — from hyprland-ui@0.1.0.
 */
export interface CodeViewProps {
  /** File name in the status line. */
  file?: string;
  /** Source lines; tokens get coloured by a tiny Lua/JS-ish highlighter. */
  code?: string;
  /** 1-based line holding the cursor. */
  cursorLine?: number;
  /** Vim mode in the status line. */
  mode?: "NORMAL" | "INSERT" | "VISUAL";
  className?: string;
}

export declare const CodeView: React.ComponentType<CodeViewProps>;
