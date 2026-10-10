import type { ReactNode } from "react";
import type { AccentSlot } from "../theme/palette";

export type AnnotateTool = "pointer" | "arrow" | "line" | "rect" | "ellipse" | "marker" | "brush" | "text" | "number" | "blur";

export type P = { x: number; y: number };

export interface Shape {
  tool: Exclude<AnnotateTool, "pointer">;
  colour: AccentSlot | "text" | "crust";
  size: 1 | 2 | 3;
  fill?: boolean;
  /** Start and end (or, for brush, every point). */
  points: P[];
  text?: string;
}

export const TOOLS: [AnnotateTool, string, string][] = [
  ["pointer", "V", "Pointer"],
  ["arrow", "A", "Arrow"],
  ["line", "L", "Line"],
  ["rect", "R", "Rectangle"],
  ["ellipse", "E", "Ellipse"],
  ["marker", "M", "Highlighter"],
  ["brush", "D", "Brush"],
  ["text", "T", "Text"],
  ["number", "N", "Numbered marker"],
  ["blur", "B", "Blur (redact)"],
];

export const COLOURS: Shape["colour"][] = ["red", "peach", "yellow", "green", "blue", "mauve", "text", "crust"];
const STROKE = { 1: 3, 2: 6, 3: 11 } as const;
export const FONT = { 1: 20, 2: 30, 3: 44 } as const;

export function ToolGlyph({ tool }: { tool: AnnotateTool }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "square" as const };
  const g: Record<AnnotateTool, ReactNode> = {
    pointer: <path d="M6 3l12 9-6 1-3 6z" {...common} strokeLinejoin="miter" />,
    arrow: (
      <>
        <path d="M5 19L19 5" {...common} />
        <path d="M10 5h9v9" {...common} />
      </>
    ),
    line: <path d="M5 19L19 5" {...common} />,
    rect: <rect x="4" y="6" width="16" height="12" {...common} />,
    ellipse: <ellipse cx="12" cy="12" rx="8" ry="6" {...common} />,
    marker: <path d="M4 17h16" {...common} strokeWidth={6} opacity={0.5} />,
    brush: <path d="M4 16c3-6 5 2 8-3s5-5 8-1" {...common} />,
    text: <path d="M6 6h12M12 6v13" {...common} />,
    number: (
      <>
        <circle cx="12" cy="12" r="8" {...common} />
        <path d="M11 9l2-1v8" {...common} />
      </>
    ),
    blur: <path d="M5 7h3M10 7h3M15 7h3M7 11h3M12 11h3M5 15h3M10 15h3M15 15h3" {...common} strokeWidth={2.4} />,
  };
  return (
    <svg data-component="ToolGlyph" viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      {g[tool]}
    </svg>
  );
}

export const col = (c: Shape["colour"]) => `var(--hx-${c})`;

/** One annotation as SVG, in the 1:1 coordinates of the captured region. */
export function ShapeSvg(props: { s: Shape; n: number }) {
  return <g data-component="ShapeSvg">{shapeSvg(props)}</g>;
}

function shapeSvg({ s, n }: { s: Shape; n: number }) {
  const [a, b = a] = [s.points[0]!, s.points.at(-1)];
  const w = STROKE[s.size],
    c = col(s.colour);
  const box = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
  switch (s.tool) {
    case "line":
      return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c} strokeWidth={w} strokeLinecap="round" />;
    case "arrow": {
      const ang = Math.atan2(b.y - a.y, b.x - a.x),
        head = 10 + w * 3;
      const p1 = { x: b.x - head * Math.cos(ang - 0.45), y: b.y - head * Math.sin(ang - 0.45) };
      const p2 = { x: b.x - head * Math.cos(ang + 0.45), y: b.y - head * Math.sin(ang + 0.45) };
      const end = { x: b.x - head * 0.7 * Math.cos(ang), y: b.y - head * 0.7 * Math.sin(ang) };
      return (
        <g>
          <line x1={a.x} y1={a.y} x2={end.x} y2={end.y} stroke={c} strokeWidth={w} strokeLinecap="round" />
          <polygon points={`${b.x},${b.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={c} />
        </g>
      );
    }
    case "rect":
      return <rect {...{ x: box.x, y: box.y, width: box.w, height: box.h }} stroke={c} strokeWidth={w} fill={s.fill ? c : "none"} fillOpacity={0.35} />;
    case "ellipse":
      return (
        <ellipse
          cx={box.x + box.w / 2}
          cy={box.y + box.h / 2}
          rx={box.w / 2}
          ry={box.h / 2}
          stroke={c}
          strokeWidth={w}
          fill={s.fill ? c : "none"}
          fillOpacity={0.35}
        />
      );
    case "marker":
      return <line x1={a.x} y1={a.y} x2={b.x} y2={a.y} stroke={c} strokeWidth={w * 5} strokeOpacity={0.4} strokeLinecap="butt" />;
    case "brush":
      return (
        <polyline points={s.points.map((p) => `${p.x},${p.y}`).join(" ")} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      );
    case "text":
      return (
        <text
          x={a.x}
          y={a.y}
          fill={c}
          fontSize={FONT[s.size]}
          fontFamily="var(--hx-font)"
          fontWeight={700}
          dominantBaseline="hanging"
          paintOrder="stroke"
          stroke="var(--hx-crust)"
          strokeWidth={4}
        >
          {s.text}
        </text>
      );
    case "number": {
      const r = 12 + s.size * 5;
      return (
        <g>
          <circle cx={a.x} cy={a.y} r={r} fill={c} stroke="var(--hx-crust)" strokeWidth={2} />
          <text
            x={a.x}
            y={a.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--hx-crust)"
            fontSize={r * 1.1}
            fontWeight={800}
            fontFamily="var(--hx-font)"
          >
            {n}
          </text>
        </g>
      );
    }
    case "blur":
      return null;
  }
}
