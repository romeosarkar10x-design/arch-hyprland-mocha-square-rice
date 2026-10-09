import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Button, Desktop, Icon } from "../ui";
import type { AccentSlot } from "../theme/palette";
import "./shell.css";

export type AnnotateTool = "pointer" | "arrow" | "line" | "rect" | "ellipse" | "marker" | "brush" | "text" | "number" | "blur";

type P = { x: number; y: number };

export interface Shape {
  tool: Exclude<AnnotateTool, "pointer">;
  colour: AccentSlot | "text" | "crust";
  size: 1 | 2 | 3;
  fill?: boolean;
  /** Start and end (or, for brush, every point). */
  points: P[];
  text?: string;
}

const TOOLS: [AnnotateTool, string, string][] = [
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

const COLOURS: Shape["colour"][] = ["red", "peach", "yellow", "green", "blue", "mauve", "text", "crust"];
const STROKE = { 1: 3, 2: 6, 3: 11 } as const;
const FONT = { 1: 20, 2: 30, 3: 44 } as const;

function ToolGlyph({ tool }: { tool: AnnotateTool }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "square" as const };
  const g: Record<AnnotateTool, ReactNode> = {
    pointer: <path d="M6 3l12 9-6 1-3 6z" {...common} strokeLinejoin="miter" />,
    arrow: <><path d="M5 19L19 5" {...common} /><path d="M10 5h9v9" {...common} /></>,
    line: <path d="M5 19L19 5" {...common} />,
    rect: <rect x="4" y="6" width="16" height="12" {...common} />,
    ellipse: <ellipse cx="12" cy="12" rx="8" ry="6" {...common} />,
    marker: <path d="M4 17h16" {...common} strokeWidth={6} opacity={0.5} />,
    brush: <path d="M4 16c3-6 5 2 8-3s5-5 8-1" {...common} />,
    text: <path d="M6 6h12M12 6v13" {...common} />,
    number: <><circle cx="12" cy="12" r="8" {...common} /><path d="M11 9l2-1v8" {...common} /></>,
    blur: <path d="M5 7h3M10 7h3M15 7h3M7 11h3M12 11h3M5 15h3M10 15h3M15 15h3" {...common} strokeWidth={2.4} />,
  };
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      {g[tool]}
    </svg>
  );
}

const col = (c: Shape["colour"]) => `var(--hx-${c})`;

function ShapeSvg({ s, n }: { s: Shape; n: number }) {
  const [a, b = a] = [s.points[0]!, s.points.at(-1)];
  const w = STROKE[s.size], c = col(s.colour);
  const box = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
  switch (s.tool) {
    case "line":
      return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c} strokeWidth={w} strokeLinecap="round" />;
    case "arrow": {
      const ang = Math.atan2(b.y - a.y, b.x - a.x), head = 10 + w * 3;
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
      return <ellipse cx={box.x + box.w / 2} cy={box.y + box.h / 2} rx={box.w / 2} ry={box.h / 2} stroke={c} strokeWidth={w} fill={s.fill ? c : "none"} fillOpacity={0.35} />;
    case "marker":
      return <line x1={a.x} y1={a.y} x2={b.x} y2={a.y} stroke={c} strokeWidth={w * 5} strokeOpacity={0.4} strokeLinecap="butt" />;
    case "brush":
      return <polyline points={s.points.map((p) => `${p.x},${p.y}`).join(" ")} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    case "text":
      return (
        <text x={a.x} y={a.y} fill={c} fontSize={FONT[s.size]} fontFamily="var(--hx-font)" fontWeight={700} dominantBaseline="hanging" paintOrder="stroke" stroke="var(--hx-crust)" strokeWidth={4}>
          {s.text}
        </text>
      );
    case "number": {
      const r = 12 + s.size * 5;
      return (
        <g>
          <circle cx={a.x} cy={a.y} r={r} fill={c} stroke="var(--hx-crust)" strokeWidth={2} />
          <text x={a.x} y={a.y + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--hx-crust)" fontSize={r * 1.1} fontWeight={800} fontFamily="var(--hx-font)">
            {n}
          </text>
        </g>
      );
    }
    case "blur":
      return null;
  }
}

export const demoAnnotations: Shape[] = [
  { tool: "rect", colour: "red", size: 1, points: [{ x: 40, y: 60 }, { x: 560, y: 380 }] },
  { tool: "arrow", colour: "red", size: 2, points: [{ x: 760, y: 520 }, { x: 575, y: 395 }] },
  { tool: "text", colour: "yellow", size: 2, points: [{ x: 600, y: 535 }], text: "this panel, but square" },
  { tool: "number", colour: "mauve", size: 2, points: [{ x: 70, y: 90 }] },
  { tool: "number", colour: "mauve", size: 2, points: [{ x: 640, y: 120 }] },
  { tool: "blur", colour: "text", size: 1, points: [{ x: 620, y: 300 }, { x: 900, y: 360 }] },
  { tool: "marker", colour: "yellow", size: 1, points: [{ x: 640, y: 180 }, { x: 900, y: 180 }] },
];

export interface ScreenshotAnnotatorProps {
  /** Region of the 1920×1080 screen that was captured. */
  region?: { x: number; y: number; w: number; h: number };
  shapes?: Shape[];
  tool?: AnnotateTool;
  colour?: Shape["colour"];
  size?: Shape["size"];
  fill?: boolean;
  onExport?: (action: "copy" | "save", shapes: Shape[]) => void;
  width?: number;
  className?: string;
}

/**
 * satty-style editor that opens after a capture: arrows, boxes, highlighter, brush, text,
 * numbered markers and blur, in theme colours. Keys: V A L R E M D T N B pick tools,
 * 1 2 3 size, F fill, Ctrl+Z / Ctrl+Shift+Z undo / redo, Ctrl+C copy, Ctrl+S save.
 */
export function ScreenshotAnnotator({
  region = { x: 1000, y: 34, w: 920, h: 600 },
  shapes: initial = demoAnnotations,
  tool: initialTool = "arrow",
  colour: initialColour = "red",
  size: initialSize = 2,
  fill: initialFill = false,
  onExport,
  width = 1100,
  className,
}: ScreenshotAnnotatorProps) {
  const [shapes, setShapes] = useState(initial);
  const [undone, setUndone] = useState<Shape[]>([]);
  const [tool, setTool] = useState(initialTool);
  const [colour, setColour] = useState(initialColour);
  const [size, setSize] = useState(initialSize);
  const [fill, setFill] = useState(initialFill);
  const [draft, setDraft] = useState<Shape | null>(null);
  const [typing, setTyping] = useState<{ at: P; value: string } | null>(null);
  const [toast, setToast] = useState<{ text: string; n: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const scale = width / region.w;

  const add = (s: Shape) => {
    setShapes((xs) => [...xs, s]);
    setUndone([]);
  };
  const at = (e: PointerEvent): P => {
    const r = svg.current!.getBoundingClientRect();
    return { x: Math.round(((e.clientX - r.left) / r.width) * region.w), y: Math.round(((e.clientY - r.top) / r.height) * region.h) };
  };
  const commitText = () => {
    if (typing?.value.trim()) add({ tool: "text", colour, size, points: [typing.at], text: typing.value });
    setTyping(null);
  };
  const exportAs = (action: "copy" | "save") => {
    setToast({ text: action === "copy" ? "Copied to clipboard" : `Saved ~/Pictures/Screenshots/${new Date().toISOString().slice(0, 10)}-annotated.png`, n: (toast?.n ?? 0) + 1 });
    onExport?.(action, shapes);
  };
  const undo = () => {
    const last = shapes.at(-1);
    if (!last) return;
    setShapes(shapes.slice(0, -1));
    setUndone([...undone, last]);
  };
  const redo = () => {
    const last = undone.at(-1);
    if (!last) return;
    setUndone(undone.slice(0, -1));
    setShapes([...shapes, last]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (typing) return;
    const k = e.key.toLowerCase();
    if (e.ctrlKey && k === "z" && e.shiftKey) redo();
    else if (e.ctrlKey && k === "z") undo();
    else if (e.ctrlKey && k === "y") redo();
    else if (e.ctrlKey && k === "c") exportAs("copy");
    else if (e.ctrlKey && k === "s") exportAs("save");
    else if (!e.ctrlKey && TOOLS.some(([, key]) => key.toLowerCase() === k)) setTool(TOOLS.find(([, key]) => key.toLowerCase() === k)![0]);
    else if (k === "1" || k === "2" || k === "3") setSize(Number(k) as Shape["size"]);
    else if (k === "f") setFill((f) => !f);
    else return;
    e.preventDefault();
  };

  const numbers = new Map<Shape, number>();
  shapes.filter((s) => s.tool === "number").forEach((s, i) => numbers.set(s, i + 1));
  const all = draft ? [...shapes, draft] : shapes;

  return (
    <div className={["rx-sat", className].filter(Boolean).join(" ")} style={{ width }} tabIndex={0} onKeyDown={onKeyDown}>
      <div className="rx-sat-bar">
        <div className="rx-sat-tools" role="toolbar" aria-label="tools">
          {TOOLS.map(([t, key, label]) => (
            <button key={t} type="button" title={`${label} (${key})`} className={t === tool ? "is-active" : undefined} onClick={() => setTool(t)}>
              <ToolGlyph tool={t} />
            </button>
          ))}
        </div>
        <span className="rx-shot-div" />
        <div className="rx-sat-colours" role="radiogroup" aria-label="colour">
          {COLOURS.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={c === colour} title={c} className={c === colour ? "is-active" : undefined} style={{ background: col(c) }} onClick={() => setColour(c)} />
          ))}
        </div>
        <span className="rx-shot-div" />
        <div className="rx-seg">
          {([1, 2, 3] as const).map((s) => (
            <Button key={s} size="sm" variant={s === size ? "primary" : "ghost"} onClick={() => setSize(s)}>
              {["S", "M", "L"][s - 1]}
            </Button>
          ))}
        </div>
        <Button size="sm" variant={fill ? "primary" : "ghost"} onClick={() => setFill(!fill)} title="Fill shapes (F)">
          fill
        </Button>
      </div>

      <div className="rx-sat-canvas" style={{ height: region.h * scale }}>
        <div className="rx-sat-shot" style={{ width: 1920, height: 1080, transform: `scale(${scale}) translate(${-region.x}px, ${-region.y}px)` }}>
          <Desktop paused notifications={false} wallpaper="image" />
        </div>
        {all
          .filter((s) => s.tool === "blur")
          .map((s, i) => {
            const [a, b = a] = [s.points[0]!, s.points.at(-1)];
            return (
              <div
                key={i}
                className="rx-sat-blur"
                style={{ left: Math.min(a.x, b.x) * scale, top: Math.min(a.y, b.y) * scale, width: Math.abs(b.x - a.x) * scale, height: Math.abs(b.y - a.y) * scale }}
              />
            );
          })}
        <svg
          ref={svg}
          className={`rx-sat-svg rx-sat-svg--${tool}`}
          viewBox={`0 0 ${region.w} ${region.h}`}
          onPointerDown={(e) => {
            if (tool === "pointer") return;
            const p = at(e);
            if (tool === "text") {
              commitText();
              setTyping({ at: p, value: "" });
              return;
            }
            if (tool === "number") {
              add({ tool, colour, size, points: [p] });
              return;
            }
            e.currentTarget.setPointerCapture(e.pointerId);
            setDraft({ tool, colour, size, fill, points: [p, p] });
          }}
          onPointerMove={(e) => {
            if (!draft) return;
            const p = at(e);
            setDraft({ ...draft, points: draft.tool === "brush" ? [...draft.points, p] : [draft.points[0]!, p] });
          }}
          onPointerUp={() => {
            if (!draft) return;
            const [a, b] = [draft.points[0]!, draft.points.at(-1)!];
            if (Math.hypot(b.x - a.x, b.y - a.y) > 4) add(draft);
            setDraft(null);
          }}
        >
          {all.map((s, i) => (
            <ShapeSvg key={i} s={s} n={numbers.get(s) ?? 0} />
          ))}
        </svg>
        {typing && (
          <input
            className="rx-sat-text"
            autoFocus
            value={typing.value}
            placeholder="type, ⏎ to place"
            style={{ left: typing.at.x * scale, top: typing.at.y * scale, color: col(colour), fontSize: FONT[size] * scale }}
            onChange={(e) => setTyping({ ...typing, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitText();
              if (e.key === "Escape") setTyping(null);
            }}
            onBlur={commitText}
          />
        )}
        {toast && (
          <div key={toast.n} className="rx-sat-toast">
            <Icon name="check" size={14} className="hx-green" /> {toast.text}
          </div>
        )}
      </div>

      <div className="rx-sat-foot">
        <Button size="sm" variant="ghost" icon="previous" onClick={undo} disabled={!shapes.length} title="Undo (Ctrl+Z)">
          Undo
        </Button>
        <Button size="sm" variant="ghost" icon="next" onClick={redo} disabled={!undone.length} title="Redo (Ctrl+Shift+Z)">
          Redo
        </Button>
        <Button size="sm" variant="ghost" icon="close" onClick={() => setShapes([])} disabled={!shapes.length}>
          Clear
        </Button>
        <span className="hx-spacer" />
        <span className="hx-faint">
          {region.w}×{region.h} · {shapes.length} annotations · satty
        </span>
        <Button size="sm" variant="ghost" icon="download" kbd="^S" onClick={() => exportAs("save")}>
          Save
        </Button>
        <Button size="sm" variant="primary" accent="peach" icon="screenshot" kbd="^C" onClick={() => exportAs("copy")}>
          Copy
        </Button>
      </div>
    </div>
  );
}
