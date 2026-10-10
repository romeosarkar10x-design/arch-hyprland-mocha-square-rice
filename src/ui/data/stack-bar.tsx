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

// Hatched "free space" fill.
const freeFill = "bg-[repeating-linear-gradient(135deg,var(--hx-surface0)_0_4px,transparent_4px_7px)]";

/** Proportional stacked bar with legend; the remainder is hatched free space. */
export function StackBar({ segments, total, format = (v) => String(v), hideLegend, className }: StackBarProps) {
  const used = segments.reduce((s, x) => s + x.value, 0);
  const free = Math.max(0, total - used);
  return (
    <div data-component="StackBar" className={cx("kit-type flex flex-col gap-2.5 text-text", className)}>
      <div className="flex h-4 gap-0.5">
        {segments.map((s) => (
          <i
            key={s.label}
            className="min-w-0.5 transition-[flex-grow] duration-(--hx-slow) ease-hx"
            style={{ flexGrow: s.value, background: accentVar(s.accent) }}
            title={`${s.label} ${format(s.value)}`}
          />
        ))}
        <i className={cx("min-w-0.5 transition-[flex-grow] duration-(--hx-slow) ease-hx", freeFill)} style={{ flexGrow: free }} />
      </div>
      {!hideLegend && <StackBarLegend segments={segments} free={free} format={format} />}
    </div>
  );
}

function StackBarLegend({ segments, free, format }: { segments: StackSegment[]; free: number; format: (value: number) => string }) {
  const item = "inline-flex items-center gap-1.5";
  const swatch = "inline-block size-2";
  return (
    <div data-component="StackBarLegend" className="flex flex-wrap gap-[18px] text-[11px] text-subtext0">
      {segments.map((s) => (
        <span key={s.label} className={item}>
          <i className={swatch} style={{ background: accentVar(s.accent) }} />
          {s.label} <b className="font-medium text-text">{format(s.value)}</b>
        </span>
      ))}
      <span className={item}>
        <i className={cx(swatch, freeFill)} />
        {"free "}
        <b className="font-medium text-text">{format(free)}</b>
      </span>
    </div>
  );
}
