import { useState, type CSSProperties } from "react";
import { Button } from "../ui";
import { ANIMATIONS, CURVES, resolveAnim, type AnimLeaf, type Bezier } from "./config";
import "./hypr.css";

function CurvePlot({ name, b }: { name: string; b: Bezier }) {
  // y can overshoot (overshot: 1.05), so leave headroom.
  const S = 120, pad = 14, y = (v: number) => pad + (1 - v) * (S - pad * 2) * 0.86 + 8, x = (v: number) => pad + v * (S - pad * 2);
  return (
    <figure className="rx-curve">
      <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} aria-label={`${name} curve`}>
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(0)} className="rx-curve-axis" />
        <line x1={x(0)} y1={y(1)} x2={x(1)} y2={y(1)} className="rx-curve-axis" />
        <line x1={x(0)} y1={y(0)} x2={x(b[0])} y2={y(b[1])} className="rx-curve-handle" />
        <line x1={x(1)} y1={y(1)} x2={x(b[2])} y2={y(b[3])} className="rx-curve-handle" />
        <path d={`M${x(0)},${y(0)} C${x(b[0])},${y(b[1])} ${x(b[2])},${y(b[3])} ${x(1)},${y(1)}`} className="rx-curve-path" />
      </svg>
      <figcaption>
        <b>{name}</b>
        <small>{b.join(", ")}</small>
      </figcaption>
    </figure>
  );
}

export interface AnimationCurvesProps {
  animations?: Record<string, AnimLeaf>;
  curves?: Record<string, Bezier>;
  /** Slow motion factor for the preview tracks. */
  timeScale?: number;
}

/** Every bezier and animation leaf from hyprland.lua, with a moving preview of each timing. */
export function AnimationCurves({ animations = ANIMATIONS, curves = CURVES, timeScale = 1 }: AnimationCurvesProps) {
  const [run, setRun] = useState(0);
  return (
    <div className="rx-anims">
      <section className="rx-anims-curves">
        {Object.entries(curves).map(([n, b]) => (
          <CurvePlot key={n} name={n} b={b} />
        ))}
      </section>
      <div className="rx-anims-head">
        <span className="hx-caps">leaf · speed · bezier · style</span>
        <span className="hx-spacer" />
        <Button size="sm" variant="primary" icon="play" onClick={() => setRun((r) => r + 1)}>
          Replay
        </Button>
      </div>
      <ul className="rx-anims-list">
        {Object.entries(animations).map(([leaf, a]) => {
          const r = resolveAnim(leaf, animations, curves, timeScale);
          const loop = a.style?.startsWith("loop");
          return (
            <li key={leaf}>
              <code>{leaf}</code>
              <span>{r.ms ? `${a.speed} → ${Math.round(r.ms)} ms` : "off"}</span>
              <span className="hx-faint">{a.bezier}</span>
              <span className="hx-faint">{a.style ?? ""}</span>
              <div className="rx-anims-track">
                <i
                  key={run}
                  style={{ animation: r.ms ? `rx-anims-go ${r.ms}ms ${r.easing} ${loop ? "infinite" : "both"}` : "none" } as CSSProperties}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
