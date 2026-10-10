import { type ReactNode } from "react";
import { cx } from "../lib";

export interface UnitProps {
  children: ReactNode;
  className?: string;
}

/** Dim unit suffix inside a bar readout. */
export function Unit({ children, className }: UnitProps) {
  return (
    <span data-component="Unit" className={cx("ml-px text-overlay1", className)}>
      {children}
    </span>
  );
}
