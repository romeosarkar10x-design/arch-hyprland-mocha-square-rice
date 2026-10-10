import { useState } from "react";
import { accentVar, cx, resolveColor, useCanvas, type Accent } from "../lib";

export interface GraphSeries {
  label: string;
  data: number[];
  accent?: Accent;
  /** Draw below the midline (upload under download). */
  mirror?: boolean;
}

export interface GraphProps {
  series: GraphSeries[];
  /** Fixed full scale. Omit to auto-scale to the largest sample. */
  max?: number;
  /** Total sample slots across the width (history length). */
  capacity?: number;
  height?: number;
  /** Formats values in the hover readout and the scale label. */
  format?: (value: number) => string;
  /** Horizontal grid lines. */
  gridLines?: number;
  /** "area" fills under the line; "bars" draws one column per sample. */
  kind?: "area" | "bars";
  className?: string;
}

/** Canvas history graph with gradient fill, dotted grid and hover crosshair readout. `mirror` puts a series below the midline (down/up traffic). */
export function Graph({
  series,
  max,
  capacity = 60,
  height = 96,
  format = (v) => `${Math.round(v)}%`,
  gridLines = 3,
  kind = "area",
  className,
}: GraphProps) {
  const [hover, setHover] = useState<number | null>(null);
  const mirrored = series.some((s) => s.mirror);
  const peak = Math.max(1, ...series.flatMap((s) => s.data));
  const scale = max ?? niceMax(peak);
  const canvas = useCanvas(
    (ctx, w, h) => {
      const el = ctx.canvas;
      const grid = resolveColor(el, "var(--hx-surface0)");
      const mid = mirrored ? h / 2 : h;
      const span = mirrored ? h / 2 - 4 : h - 4;
      const step = w / (capacity - 1);
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      for (let i = 1; i <= gridLines; i++) {
        const y = Math.round((h / (gridLines + 1)) * i) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      for (const s of series) {
        const color = resolveColor(el, accentVar(s.accent));
        const pts = s.data.slice(-capacity);
        const x0 = w - (pts.length - 1) * step;
        const sc = mirrored && max == null ? niceMax(Math.max(1, ...pts)) : scale;
        const y = (v: number) => (s.mirror ? mid + (v / sc) * span : mid - (v / sc) * span);
        if (kind === "bars") {
          ctx.fillStyle = color;
          const bw = Math.max(1, step - 1);
          pts.forEach((v, i) => {
            const x = x0 + i * step - bw / 2;
            const top = y(v);
            ctx.globalAlpha = i === pts.length - 1 ? 1 : 0.55;
            ctx.fillRect(x, Math.min(top, mid), bw, Math.abs(mid - top));
          });
          ctx.globalAlpha = 1;
          continue;
        }
        const grad = ctx.createLinearGradient(0, s.mirror ? h : 0, 0, mid);
        grad.addColorStop(0, hexA(color, 0.42));
        grad.addColorStop(1, hexA(color, 0.02));
        ctx.beginPath();
        ctx.moveTo(x0, mid);
        pts.forEach((v, i) => ctx.lineTo(x0 + i * step, y(v)));
        ctx.lineTo(w, mid);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        pts.forEach((v, i) => (i ? ctx.lineTo(x0 + i * step, y(v)) : ctx.moveTo(x0, y(v))));
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = "miter";
        ctx.stroke();
        const last = pts[pts.length - 1];
        if (last != null) {
          ctx.fillStyle = color;
          ctx.fillRect(w - 4, y(last) - 2, 4, 4);
        }
      }
      if (mirrored) {
        ctx.strokeStyle = resolveColor(el, "var(--hx-surface1)");
        ctx.beginPath();
        ctx.moveTo(0, mid + 0.5);
        ctx.lineTo(w, mid + 0.5);
        ctx.stroke();
      }
      if (hover != null) {
        const x = Math.round(hover * w) + 0.5;
        ctx.strokeStyle = resolveColor(el, "var(--hx-overlay0)");
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    },
    [series, scale, hover, capacity, kind, gridLines],
  );
  const readout =
    hover == null
      ? null
      : series.map((s) => {
          const pts = s.data.slice(-capacity);
          const idx = Math.round(hover * (capacity - 1)) - (capacity - pts.length);
          return { s, v: idx >= 0 && idx < pts.length ? pts[idx] : null };
        });
  const ago = hover == null ? 0 : Math.round((1 - hover) * (capacity - 1));
  return (
    <div className={cx("hx-graph", className)}>
      <div
        className="hx-graph-box"
        style={{ height }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <canvas ref={canvas} />
        <span className="hx-graph-scale">{format(scale)}</span>
        {readout && hover != null && (
          <span className="hx-graph-tip" style={{ left: `${Math.min(80, Math.max(20, hover * 100))}%` }}>
            <span className="hx-faint">-{ago}s</span>
            {readout.map(({ s, v }) => (
              <span key={s.label} style={{ color: accentVar(s.accent) }}>
                {s.label} {v == null ? "—" : format(v)}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (v <= m * p) return m * p;
  return 10 * p;
}

function hexA(color: string, a: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m) return color;
  const n = parseInt(m[1]!, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
