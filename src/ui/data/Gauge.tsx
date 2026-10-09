import { type ReactNode } from "react";
import { accentVar, clamp, cx, level, levelVar, useTween, type Accent } from "../lib";

export interface GaugeProps {
  /** Current value in the gauge's own unit. */
  value: number;
  /** Full-scale value. Defaults to 100. */
  max?: number;
  /** Caption under the number, e.g. "LOAD", "TEMP". */
  label: string;
  /** Unit after the number, e.g. "%", "°", "W". */
  unit?: string;
  /** Small line under the caption, e.g. "of 220 W". */
  sub?: ReactNode;
  /** Colour while below the warn threshold. */
  accent?: Accent;
  /** Thresholds as percentages of max. Defaults to 60 / 90. */
  warn?: number;
  crit?: number;
  /** Outer size in px. */
  size?: number;
  /** Number of segments around the 270° arc. */
  segments?: number;
  className?: string;
}

/** 270° segmented arc gauge with animated number. Turns yellow past `warn` and red past `crit` (percent of max). */
export function Gauge({
  value,
  max = 100,
  label,
  unit = "%",
  sub,
  accent = "sky",
  warn = 60,
  crit = 90,
  size = 116,
  segments = 36,
  className,
}: GaugeProps) {
  const pct = clamp((value / max) * 100);
  const lv = level(pct, warn, crit);
  const color = levelVar(lv, accentVar(accent));
  const shown = useTween(value);
  const r = size / 2 - 8;
  const c = size / 2;
  const start = 135;
  const sweep = 270;
  const gap = 2.2;
  const each = sweep / segments;
  const lit = Math.round((pct / 100) * segments);
  const arc = (a0: number, a1: number) => {
    const p = (a: number): [number, number] => [c + r * Math.cos((a * Math.PI) / 180), c + r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  };
  return (
    <div
      className={cx("hx-gauge", `is-${lv}`, className)}
      style={{ width: size, height: size, ["--hx-g" as string]: color }}
      role="meter"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: segments }, (_, i) => {
          const a0 = start + i * each + gap / 2;
          const a1 = start + (i + 1) * each - gap / 2;
          return (
            <path
              key={i}
              d={arc(a0, a1)}
              className={cx("hx-gauge-seg", i < lit && "is-on", i === lit - 1 && "is-head")}
              strokeWidth={i < lit ? 7 : 5}
              fill="none"
            />
          );
        })}
      </svg>
      <div className="hx-gauge-val">
        <span className="hx-gauge-num">
          {Math.round(shown)}
          <small>{unit}</small>
        </span>
        <span className="hx-gauge-cap">{label}</span>
        {sub && <span className="hx-gauge-sub">{sub}</span>}
      </div>
    </div>
  );
}
