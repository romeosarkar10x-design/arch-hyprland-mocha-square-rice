import { type CSSProperties, type ReactNode } from "react";
import { accentVar, cx, type Accent } from "../lib";

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** Small trailing text after the value, e.g. unit or delta. */
  hint?: ReactNode;
  accent?: Accent;
  className?: string;
}

/** Caps label over a large mono figure. Put 2–4 inside a `<StatGrid>`. */
export function Stat({ label, value, hint, accent, className }: StatProps) {
  return (
    <div data-component="Stat" className={cx("kit-type flex flex-col gap-1 bg-mantle px-3 py-2.5 text-text", className)}>
      <span className="caps">{label}</span>
      <span className="text-[19px] font-bold tracking-[-.02em] whitespace-nowrap" style={accent ? { color: accentVar(accent) } : undefined}>
        {value}
        {hint && <small className="ml-1 text-[11px] font-normal tracking-normal text-subtext0">{hint}</small>}
      </span>
    </div>
  );
}

export interface StatGridProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Row of equal-width `<Stat>` cells split by hairlines. */
export function StatGrid({ children, className, style }: StatGridProps) {
  return (
    <div data-component="StatGrid" className={cx("grid auto-cols-fr grid-flow-col gap-0.5 bg-surface0 ring ring-surface0", className)} style={style}>
      {children}
    </div>
  );
}
