import { type ReactNode } from "react";

export interface UnitProps {
  children: ReactNode;
}

/** Dim unit suffix inside a bar readout. */
export function Unit({ children }: UnitProps) {
  return <span className="hx-unit">{children}</span>;
}
