import { useState, type CSSProperties } from "react";
import { Button } from "../ui";
import { ANIMATIONS, CURVES, resolveAnim, type AnimLeaf, type Bezier } from "./config";

function CurvePlot({ name, b }: { name: string; b: Bezier }) {
  // y can overshoot (overshot: 1.05), so leave headroom.
  const S = 120, pad = 14, y = (v: number) => pad + (1 - v) * (S - pad * 2) * 0.86 + 8, x = (v: number) => pad + v * (S - pad * 2);
  return (
    <figure data-component="CurvePlot" className="m-0 bg-mantle p-2 ring ring-surface0">
      <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} aria-label={`${name} curve`}>
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(0)} className="stroke-surface1 [stroke-dasharray:2_3]" />
        <line x1={x(0)} y1={y(1)} x2={x(1)} y2={y(1)} className="stroke-surface1 [stroke-dasharray:2_3]" />
        <line x1={x(0)} y1={y(0)} x2={x(b[0])} y2={y(b[1])} className="stroke-overlay0" />
        <line x1={x(1)} y1={y(1)} x2={x(b[2])} y2={y(b[3])} className="stroke-overlay0" />
        <path d={`M${x(0)},${y(0)} C${x(b[0])},${y(b[1])} ${x(b[2])},${y(b[3])} ${x(1)},${y(1)}`} className="fill-none stroke-mauve stroke-[2.5]" />
      </svg>
      <figcaption className="flex flex-col text-[11.5px]">
        <b>{name}</b>
        <small className="text-overlay1">{b.join(", ")}</small>
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
    <div data-component="AnimationCurves" className="grid max-w-[1100px] gap-4 font-hx text-text">
      <section className="flex flex-wrap gap-3">
        {Object.entries(curves).map(([n, b]) => (
          <CurvePlot key={n} name={n} b={b} />
        ))}
      </section>
      <div className="flex items-center">
        <span className="caps">leaf · speed · bezier · style</span>
        <span className="flex-1" />
        <Button size="sm" variant="primary" icon="play" onClick={() => setRun((r) => r + 1)}>
          Replay
        </Button>
      </div>
      <ul className="m-0 grid list-none gap-0.5 p-0">
        {Object.entries(animations).map(([leaf, a]) => {
          const r = resolveAnim(leaf, animations, curves, timeScale);
          const loop = a.style?.startsWith("loop");
          return (
            <li key={leaf} data-component="AnimLeafRow" className="grid grid-cols-[150px_150px_120px_110px_1fr] items-center gap-2.5 bg-mantle px-2.5 py-[5px] text-[12px]">
              <code className="text-mauve">{leaf}</code>
              <span>{r.ms ? `${a.speed} → ${Math.round(r.ms)} ms` : "off"}</span>
              <span className="text-overlay1">{a.bezier}</span>
              <span className="text-overlay1">{a.style ?? ""}</span>
              <div className="relative h-2.5 bg-surface0">
                <i
                  key={run}
                  className="absolute top-0 left-0 size-2.5 bg-mauve"
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
