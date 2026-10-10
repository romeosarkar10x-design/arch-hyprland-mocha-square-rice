import { useRef } from "react";
import { accentVar, cx, resolveColor, useCanvas, type Accent } from "../lib";
import { useSpectrum } from "../stats";

export interface VisualizerProps {
  /** Bar heights 0–100 (e.g. cava output). Omit to run the built-in simulated spectrum. */
  bars?: number[];
  /** Number of bars when simulating. */
  count?: number;
  /** Simulated playback state; false settles to a flat line. */
  playing?: boolean;
  /** Height in px or any CSS length (e.g. "100%"). */
  height?: string | number;
  /** "bars" = square columns with peak caps; "mirror" = columns reflected around the middle. */
  variant?: "bars" | "mirror";
  /** Gradient from the bass end to the treble end. */
  from?: Accent;
  to?: Accent;
  className?: string;
}

/** cava-style audio spectrum on canvas with falling peak caps and a bass→treble gradient. Runs a built-in simulation when `bars` is omitted. */
export function Visualizer({
  bars,
  count = 48,
  playing = true,
  height = 92,
  variant = "bars",
  from = "mauve",
  to = "sky",
  className,
}: VisualizerProps) {
  const sim = useSpectrum(count, playing && !bars);
  const v = bars ?? sim;
  const peaks = useRef<number[]>([]);
  const ref = useCanvas(
    (ctx, w, h) => {
      const el = ctx.canvas;
      const n = v.length;
      const gap = 2;
      const bw = (w - gap * (n - 1)) / n;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, resolveColor(el, accentVar(from)));
      grad.addColorStop(1, resolveColor(el, accentVar(to)));
      const capColor = resolveColor(el, "var(--hx-text)");
      if (peaks.current.length !== n) peaks.current = Array(n).fill(0);
      v.forEach((val, i) => {
        const x = i * (bw + gap);
        const p = Math.max(val, peaks.current[i]! - 1.6);
        peaks.current[i] = p;
        ctx.fillStyle = grad;
        if (variant === "mirror") {
          const bh = (val / 100) * (h / 2 - 2);
          ctx.fillRect(x, h / 2 - bh, bw, bh * 2);
        } else {
          const bh = (val / 100) * (h - 6);
          ctx.fillRect(x, h - bh, bw, bh);
          ctx.fillStyle = capColor;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(x, h - (p / 100) * (h - 6) - 3, bw, 2);
          ctx.globalAlpha = 1;
        }
      });
    },
    [v, variant, from, to],
  );
  return (
    <div className={cx("hx-viz", className)} style={{ height }}>
      <canvas ref={ref} />
    </div>
  );
}
