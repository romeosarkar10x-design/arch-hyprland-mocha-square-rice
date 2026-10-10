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
    <div className={cx("hx-meter", className)} style={{ ["--hx-m" as string]: color }}>
      {(label != null || readout != null) && (
        <div className="hx-meter-top">
          <span className="hx-meter-label">{label}</span>
          <span className="hx-meter-readout">{readout ?? `${Math.round(v)}%`}</span>
        </div>
      )}
      <div className="hx-meter-cells" style={{ gridTemplateColumns: `repeat(${cells}, 1fr)`, height }}>
        {Array.from({ length: cells }, (_, i) => (
          <i key={i} className={cx(i < lit && "is-on", i === pk && i >= lit && "is-peak")} />
        ))}
      </div>
    </div>
  );
}
