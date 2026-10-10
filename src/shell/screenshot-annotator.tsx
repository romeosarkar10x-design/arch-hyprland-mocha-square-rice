import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button, Desktop, Icon, cx } from "../ui";
import { COLOURS, FONT, ShapeSvg, TOOLS, ToolGlyph, col, type AnnotateTool, type P, type Shape } from "./annotation-shapes";

export type { AnnotateTool, Shape } from "./annotation-shapes";

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
    <div
      data-component="ScreenshotAnnotator"
      className={cx("flex max-w-full flex-col bg-mantle font-hx text-text ring ring-surface0 outline-none focus-visible:ring-2 focus-visible:ring-peach", className)}
      style={{ width }}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <AnnotatorToolbar tool={tool} onTool={setTool} colour={colour} onColour={setColour} size={size} onSize={setSize} fill={fill} onFill={setFill} />

      <div className="relative overflow-hidden bg-crust" style={{ height: region.h * scale }}>
        <div
          className="pointer-events-none absolute top-0 left-0 origin-top-left"
          style={{ width: 1920, height: 1080, transform: `scale(${scale}) translate(${-region.x}px, ${-region.y}px)` }}
        >
          <Desktop paused notifications={false} wallpaper="image" />
        </div>
        {all
          .filter((s) => s.tool === "blur")
          .map((s, i) => {
            const [a, b = a] = [s.points[0]!, s.points.at(-1)];
            return (
              <div
                key={i}
                className="pointer-events-none absolute bg-base/20 backdrop-blur-[9px]"
                style={{ left: Math.min(a.x, b.x) * scale, top: Math.min(a.y, b.y) * scale, width: Math.abs(b.x - a.x) * scale, height: Math.abs(b.y - a.y) * scale }}
              />
            );
          })}
        <svg
          ref={svg}
          className={cx("absolute inset-0 size-full touch-none", tool === "pointer" ? "cursor-default" : tool === "text" ? "cursor-text" : "cursor-crosshair")}
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
            className="absolute min-w-[160px] border border-dashed border-current bg-crust/50 px-1 font-hx font-bold outline-none"
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
          <div
            key={toast.n}
            className="absolute right-3 bottom-3 flex animate-[hx-drop_.2s_var(--hx-ease)_both,rx-layer-out_.4s_linear_2s_forwards] items-center gap-2 border-l-3 border-green bg-mantle px-3 py-2 text-[12.5px] shadow-popup"
          >
            <Icon name="check" size={14} className="text-green" /> {toast.text}
          </div>
        )}
      </div>

      <div className={cx(barRow, "border-t text-[11.5px]")}>
        <Button size="sm" variant="ghost" icon="previous" onClick={undo} disabled={!shapes.length} title="Undo (Ctrl+Z)">
          Undo
        </Button>
        <Button size="sm" variant="ghost" icon="next" onClick={redo} disabled={!undone.length} title="Redo (Ctrl+Shift+Z)">
          Redo
        </Button>
        <Button size="sm" variant="ghost" icon="close" onClick={() => setShapes([])} disabled={!shapes.length}>
          Clear
        </Button>
        <span className="flex-1" />
        <span className="text-overlay1">
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

const barRow = "flex flex-wrap items-center gap-2.5 border-surface0 px-2.5 py-2";
const divider = <span className="w-px self-stretch bg-surface0" />;

interface AnnotatorToolbarProps {
  tool: AnnotateTool;
  onTool: (t: AnnotateTool) => void;
  colour: Shape["colour"];
  onColour: (c: Shape["colour"]) => void;
  size: Shape["size"];
  onSize: (s: Shape["size"]) => void;
  fill: boolean;
  onFill: (f: boolean) => void;
}

/** Tools, colour swatches, stroke size and fill. */
function AnnotatorToolbar({ tool, onTool, colour, onColour, size, onSize, fill, onFill }: AnnotatorToolbarProps) {
  return (
    <div data-component="AnnotatorToolbar" className={cx(barRow, "border-b")}>
      <div className="flex gap-0.5" role="toolbar" aria-label="tools">
        {TOOLS.map(([t, key, label]) => (
          <button
            key={t}
            type="button"
            title={`${label} (${key})`}
            className={cx(
              "unbutton grid h-[30px] w-8 cursor-pointer place-items-center bg-transparent text-subtext0 hover:bg-surface0 hover:text-text",
              t === tool && "bg-peach/18 text-peach shadow-[inset_0_-2px_0_var(--hx-peach)] hover:bg-peach/18 hover:text-peach",
            )}
            onClick={() => onTool(t)}
          >
            <ToolGlyph tool={t} />
          </button>
        ))}
      </div>
      {divider}
      <div className="flex gap-1" role="radiogroup" aria-label="colour">
        {COLOURS.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === colour}
            title={c}
            className={cx(
              "unbutton size-5 cursor-pointer",
              c === colour ? "shadow-[0_0_0_2px_var(--hx-mantle),0_0_0_4px_var(--hx-text)]" : "ring ring-surface1",
            )}
            style={{ background: col(c) }}
            onClick={() => onColour(c)}
          />
        ))}
      </div>
      {divider}
      <div>
        {([1, 2, 3] as const).map((s) => (
          <Button key={s} size="sm" variant={s === size ? "primary" : "ghost"} onClick={() => onSize(s)}>
            {["S", "M", "L"][s - 1]}
          </Button>
        ))}
      </div>
      <Button size="sm" variant={fill ? "primary" : "ghost"} onClick={() => onFill(!fill)} title="Fill shapes (F)">
        fill
      </Button>
    </div>
  );
}
