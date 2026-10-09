import { accentVar, cx, type Accent } from "../lib";

export interface CoreGridProps {
  /** Per-thread usage, 0–100. */
  cores: number[];
  /** Cells per row. */
  columns?: number;
  accent?: Accent;
  className?: string;
}

/** Per-thread heatmap; squares tint toward the accent by load and flip to yellow/red at 60/90 %. */
export function CoreGrid({ cores, columns = 8, accent = "sky", className }: CoreGridProps) {
  return (
    <div className={cx("hx-cores", className)} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {cores.map((v, i) => {
        const c = v >= 90 ? "var(--hx-red)" : v >= 60 ? "var(--hx-yellow)" : accentVar(accent);
        const mix = Math.round(12 + (v / 100) * 88);
        return (
          <div
            key={i}
            className={cx("hx-core", v >= 45 && "is-hot")}
            style={{ background: `color-mix(in srgb, ${c} ${mix}%, var(--hx-surface0))` }}
            title={`core ${i}: ${Math.round(v)}%`}
          >
            <span>{i}</span>
            <b>{Math.round(v)}</b>
          </div>
        );
      })}
    </div>
  );
}
