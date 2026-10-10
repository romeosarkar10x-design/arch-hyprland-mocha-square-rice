import { type ReactNode } from "react";
import { cx } from "../lib";

export interface KbdProps {
  /** Key label, e.g. "SUPER", "↵", "Esc". */
  children: ReactNode;
  className?: string;
}

/** Keycap for shortcut hints. */
export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      data-component="Kbd"
      className={cx(
        "kit-type mx-px inline-flex h-[18px] min-w-[18px] items-center justify-center px-[5px]",
        "border border-b-2 border-surface1 bg-base font-hx text-[10px] leading-none font-medium tracking-[.04em] text-subtext0",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
