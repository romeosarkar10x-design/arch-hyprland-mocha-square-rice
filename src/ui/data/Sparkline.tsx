import { cx } from "../lib";

export interface SparklineProps {
  /** Oldest first. */
  data: number[];
  max?: number;
  /** Number of bars shown (most recent). */
  bars?: number;
  /** Bar height in px. */
  height?: number;
  className?: string;
}

/** Tiny bar sparkline in the current text colour. Lives inside BarSegments. */
export function Sparkline({ data, max = 100, bars = 8, height = 14, className }: SparklineProps) {
  const pts = data.slice(-bars);
  return (
    <span className={cx("hx-spark", className)} style={{ height }} aria-hidden>
      {pts.map((v, i) => (
        <i key={i} style={{ height: `${Math.max(8, Math.min(100, (v / max) * 100))}%` }} />
      ))}
    </span>
  );
}
