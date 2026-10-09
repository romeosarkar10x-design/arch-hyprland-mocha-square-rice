import { type ReactNode } from "react";
import { cx } from "../lib";

export interface KbdProps {
  /** Key label, e.g. "SUPER", "↵", "Esc". */
  children: ReactNode;
  className?: string;
}

/** Keycap for shortcut hints. */
export function Kbd({ children, className }: KbdProps) {
  return <kbd className={cx("hx-kbd", className)}>{children}</kbd>;
}
