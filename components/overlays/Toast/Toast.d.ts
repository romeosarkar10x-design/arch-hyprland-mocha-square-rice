import * as React from 'react';

/**
 * Toast — from hyprland-ui@0.1.0.
 */
export interface ToastProps {
  /** App name in the meta line. */
  app: string;
  appIcon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  title: string;
  body?: React.ReactNode;
  /** Strip, tile and countdown colour. Critical notifications use red. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  urgency?: "low" | "normal" | "critical";
  /** e.g. "now", "2m". */
  time?: string;
  actions?: ToastAction[];
  /** Auto-dismiss after this many ms (countdown line pauses on hover). 0 = sticky. */
  timeout?: number;
  onClose?: () => void;
  className?: string;
}

export declare const Toast: React.ComponentType<ToastProps>;
