import { type ReactNode } from "react";
import { accentVar, clamp, cx, level, levelVar, type Accent } from "../lib";

export interface MeterProps {
  /** 0–100 fill. */
  value: number;
  /** Left caption, e.g. "VRAM". */
  label?: ReactNode;
  /** Right readout; defaults to the rounded percent. */
  readout?: ReactNode;
  accent?: Accent;
  /** Number of cells. */
  cells?: number;
  /** Optional peak marker (0–100), drawn as a bright cell. */
  peak?: number;
  /** Colour by level (yellow at 60, red at 90). Turn off for things like fan speed. */
  levels?: boolean;
  /** Cell height in px. */
  height?: number;
  className?: string;
}

/** Segmented LED-style meter with a caption row. */
export function Meter({ value, label, readout, accent = "mauve", cells = 32, peak, levels = true, height = 8, className }: MeterProps) {
  const v = clamp(value);
  const lit = Math.round((v / 100) * cells);
  const pk = peak != null ? Math.min(cells - 1, Math.round((clamp(peak) / 100) * cells) - 1) : -1;
  const color = levels ? levelVar(level(v), accentVar(accent)) : accentVar(accent);
  return (
    <div data-component="Meter" className={cx("kit-type flex flex-col gap-1.5 text-text", className)} style={{ ["--hx-m" as string]: color }}>
      {(label != null || readout != null) && (
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="text-subtext0">{label}</span>
          <span className="[&_b]:font-semibold [&_b]:text-text">{readout ?? `${Math.round(v)}%`}</span>
        </div>
      )}
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cells}, 1fr)`, height }}>
        {Array.from({ length: cells }, (_, i) => (
          <i
            key={i}
            className={cx("bg-surface0 transition-[background-color] duration-(--hx-med)", i < lit && "bg-(--hx-m)", i === pk && i >= lit && "bg-text")}
          />
        ))}
      </div>
    </div>
  );
}
