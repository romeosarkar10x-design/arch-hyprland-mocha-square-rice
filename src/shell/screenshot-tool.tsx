import { useRef, useState, type PointerEvent } from "react";
import { Button, Desktop, Icon, cx } from "../ui";

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
    <div data-component="ScreenshotTool" className={cx("kit-type flex max-w-full flex-col text-text ring ring-surface0", className)} style={{ width }}>
      <div
        className="relative cursor-crosshair touch-none overflow-hidden select-none"
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
        <div className="pointer-events-none absolute top-0 left-0 origin-top-left" style={{ width: SCREEN.w, height: SCREEN.h, transform: `scale(${scale})` }}>
          <Desktop paused notifications={false} wallpaper="image" />
        </div>
        <SelectionBox rect={shown} scale={scale} flash={flash} />
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-t border-surface0 bg-mantle px-2.5 py-2">
        <div>
          {(["region", "window", "output"] as const).map((m) => (
            <Button key={m} size="sm" variant={m === mode ? "primary" : "ghost"} accent="peach" icon={m === "region" ? "plus" : m === "window" ? "app" : "monitor"} onClick={() => setMode(m)}>
              {m}
            </Button>
          ))}
        </div>
        <span className="w-px self-stretch bg-surface0" />
        <span className="caps">
          <Icon name="timer" size={12} /> delay
        </span>
        <div>
          {([0, 3, 5] as const).map((d) => (
            <Button key={d} size="sm" variant={d === delay ? "primary" : "ghost"} accent="peach" onClick={() => setDelay(d)}>
              {d ? `${d}s` : "off"}
            </Button>
          ))}
        </div>
        <span className="flex-1" />
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

const handle = "absolute size-[13px] border-0 border-solid border-peach";

/** The region outline: peach hairline, corner handles, dimmed surroundings and a size readout. */
function SelectionBox({ rect, scale, flash }: { rect: Rect; scale: number; flash: boolean }) {
  return (
    <div
      data-component="SelectionBox"
      className={cx(
        "pointer-events-none absolute shadow-[0_0_0_9999px_color-mix(in_srgb,var(--hx-crust)_62%,transparent)] ring ring-peach",
        flash && "animate-[rx-flash_.26s]",
      )}
      style={{ left: rect.x * scale, top: rect.y * scale, width: rect.w * scale, height: rect.h * scale }}
    >
      <i className={cx(handle, "-top-[3px] -left-[3px] border-t-3 border-l-3")} />
      <i className={cx(handle, "-top-[3px] -right-[3px] border-t-3 border-r-3")} />
      <i className={cx(handle, "-bottom-[3px] -left-[3px] border-b-3 border-l-3")} />
      <i className={cx(handle, "-right-[3px] -bottom-[3px] border-r-3 border-b-3")} />
      <span className="absolute right-0 -bottom-[22px] bg-peach px-1.5 py-0.5 font-hx text-[10.5px] font-bold whitespace-nowrap text-crust">
        {rect.w} × {rect.h}
      </span>
    </div>
  );
}
