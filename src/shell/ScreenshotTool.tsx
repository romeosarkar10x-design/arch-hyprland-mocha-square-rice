import { useRef, useState, type PointerEvent } from "react";
import { Button, Desktop, Icon } from "../ds";
import "./shell.css";

type Mode = "region" | "window" | "output";
type Rect = { x: number; y: number; w: number; h: number };

export interface ScreenshotToolProps {
  mode?: Mode;
  /** Initial selection, in screen px of the 1920×1080 output. */
  selection?: Rect;
  delay?: 0 | 3 | 5;
  onCapture?: (action: "copy" | "save" | "edit", rect: Rect) => void;
  width?: number;
  className?: string;
}

const SCREEN = { w: 1920, h: 1080 };

/** hyprshot / grimblast + satty: drag a region over the frozen screen, then copy, save or annotate. */
export function ScreenshotTool({
  mode: initialMode = "region",
  selection = { x: 1112, y: 40, w: 800, h: 640 },
  delay: initialDelay = 0,
  onCapture,
  width = 1100,
  className,
}: ScreenshotToolProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [rect, setRect] = useState<Rect>(selection);
  const [delay, setDelay] = useState(initialDelay);
  const [flash, setFlash] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const scale = width / SCREEN.w;
  const shown = mode === "output" ? { x: 0, y: 0, w: SCREEN.w, h: SCREEN.h } : mode === "window" ? { x: 1112, y: 40, w: 802, h: 664 } : rect;

  const at = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: Math.round((e.clientX - r.left) / scale), y: Math.round((e.clientY - r.top) / scale) };
  };
  const capture = (action: "copy" | "save" | "edit") => {
    setFlash(true);
    setTimeout(() => setFlash(false), 260);
    onCapture?.(action, shown);
  };

  return (
    <div className={["rx-shot", className].filter(Boolean).join(" ")} style={{ width }}>
      <div
        className="rx-shot-screen"
        style={{ height: SCREEN.h * scale }}
        onPointerDown={(e) => {
          if (mode !== "region") return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = at(e);
          setRect({ ...drag.current, w: 0, h: 0 });
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const p = at(e), o = drag.current;
          setRect({ x: Math.min(o.x, p.x), y: Math.min(o.y, p.y), w: Math.abs(p.x - o.x), h: Math.abs(p.y - o.y) });
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <div className="rx-shot-frozen" style={{ width: SCREEN.w, height: SCREEN.h, transform: `scale(${scale})` }}>
          <Desktop paused notifications={false} wallpaper="image" />
        </div>
        <div
          className={`rx-shot-sel${flash ? " is-flash" : ""}`}
          style={{ left: shown.x * scale, top: shown.y * scale, width: shown.w * scale, height: shown.h * scale }}
        >
          <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
          <span className="rx-shot-size">
            {shown.w} × {shown.h}
          </span>
        </div>
      </div>
      <div className="rx-shot-bar">
        <div className="rx-seg">
          {(["region", "window", "output"] as const).map((m) => (
            <Button key={m} size="sm" variant={m === mode ? "primary" : "ghost"} accent="peach" icon={m === "region" ? "plus" : m === "window" ? "app" : "monitor"} onClick={() => setMode(m)}>
              {m}
            </Button>
          ))}
        </div>
        <span className="rx-shot-div" />
        <span className="hx-caps">
          <Icon name="timer" size={12} /> delay
        </span>
        <div className="rx-seg">
          {([0, 3, 5] as const).map((d) => (
            <Button key={d} size="sm" variant={d === delay ? "primary" : "ghost"} accent="peach" onClick={() => setDelay(d)}>
              {d ? `${d}s` : "off"}
            </Button>
          ))}
        </div>
        <span className="hx-spacer" />
        <Button size="sm" variant="ghost" icon="palette" kbd="E" onClick={() => capture("edit")}>
          Annotate
        </Button>
        <Button size="sm" variant="ghost" icon="download" kbd="S" onClick={() => capture("save")}>
          Save
        </Button>
        <Button size="sm" variant="primary" accent="peach" icon="screenshot" kbd="⏎" onClick={() => capture("copy")}>
          Copy
        </Button>
      </div>
    </div>
  );
}
