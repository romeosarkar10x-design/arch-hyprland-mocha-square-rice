import * as React from 'react';

/**
 * Toggle — from hyprland-ui@0.1.0.
 */
export interface ToggleProps {
  /** Controlled state. Omit to let the toggle manage itself from `defaultChecked`. */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Visible label to the left of the switch. */
  label?: React.ReactNode;
  /** Secondary line under the label. */
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export declare const Toggle: React.ComponentType<ToggleProps>;
