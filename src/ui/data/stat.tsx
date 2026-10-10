import { type ReactNode } from "react";
import { accentVar, cx, type Accent } from "../lib";

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** Small trailing text after the value, e.g. unit or delta. */
  hint?: ReactNode;
  accent?: Accent;
  className?: string;
}

/** Caps label over a large mono figure. Put 2–4 inside a `.hx-stats` grid. */
export function Stat({ label, value, hint, accent, className }: StatProps) {
  return (
    <div className={cx("hx-stat", className)}>
      <span className="hx-caps">{label}</span>
      <span className="hx-stat-value" style={accent ? { color: accentVar(accent) } : undefined}>
        {value}
        {hint && <small>{hint}</small>}
      </span>
    </div>
  );
}
