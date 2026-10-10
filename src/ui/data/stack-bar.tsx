import { accentVar, cx, type Accent } from "../lib";

export interface StackSegment {
  label: string;
  value: number;
  accent?: Accent;
}

export interface StackBarProps {
  /** Parts of the whole, in any unit; the bar fills by their share of `total`. */
  segments: StackSegment[];
  /** Whole; the remainder is drawn as free space. */
  total: number;
  /** Formats each legend value. */
  format?: (value: number) => string;
  /** Hide the legend under the bar. */
  hideLegend?: boolean;
  className?: string;
}

/** Proportional stacked bar with legend; the remainder is hatched free space. */
export function StackBar({ segments, total, format = (v) => String(v), hideLegend, className }: StackBarProps) {
  const used = segments.reduce((s, x) => s + x.value, 0);
  const free = Math.max(0, total - used);
  return (
    <div className={cx("hx-stack", className)}>
      <div className="hx-stack-bar">
        {segments.map((s) => (
          <i key={s.label} style={{ flexGrow: s.value, background: accentVar(s.accent) }} title={`${s.label} ${format(s.value)}`} />
        ))}
        <i className="hx-stack-free" style={{ flexGrow: free }} />
      </div>
      {!hideLegend && (
        <div className="hx-legend">
          {segments.map((s) => (
            <span key={s.label}>
              <i style={{ background: accentVar(s.accent) }} />
              {s.label} <b>{format(s.value)}</b>
            </span>
          ))}
          <span>
            <i className="hx-stack-free" />
            {"free "}
            <b>{format(free)}</b>
          </span>
        </div>
      )}
    </div>
  );
}
