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
      data-component="Gauge"
      data-level={lv}
      className={cx("kit-type relative flex-none text-text", className)}
      style={{ width: size, height: size, ["--hx-g" as string]: color }}
      role="meter"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg className="absolute inset-0 overflow-visible" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: segments }, (_, i) => {
          const a0 = start + i * each + gap / 2;
          const a1 = start + (i + 1) * each - gap / 2;
          return (
            <path
              key={i}
              d={arc(a0, a1)}
              className={cx(
                "stroke-surface0 transition-[stroke,stroke-width] duration-(--hx-med)",
                i < lit && "stroke-(--hx-g)",
                i === lit - 1 && "stroke-text",
              )}
              strokeWidth={i < lit ? 7 : 5}
              fill="none"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1.5">
        <span className="text-[27px] leading-none font-bold tracking-[-.03em] text-(--hx-g)">
          {Math.round(shown)}
          <small className="ml-px text-[12px] font-normal tracking-normal text-subtext0">{unit}</small>
        </span>
        <span className="mt-1.5 text-[9.5px] tracking-[.18em] text-subtext0 uppercase">{label}</span>
        {sub && <span className="mt-0.5 text-[10px] whitespace-nowrap text-overlay1">{sub}</span>}
      </div>
    </div>
  );
}
