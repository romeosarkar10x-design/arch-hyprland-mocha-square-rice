import * as React from 'react';

/**
 * Stat — from hyprland-ui@0.1.0.
 */
export interface StatProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Small trailing text after the value, e.g. unit or delta. */
  hint?: React.ReactNode;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  className?: string;
}

export declare const Stat: React.ComponentType<StatProps>;
