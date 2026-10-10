import { useEffect, useReducer, useRef, useState, type AnimationEvent, type CSSProperties, type KeyboardEvent } from "react";
import { Icon, Wallpaper, Workspaces, cx } from "../ui";
import { Dmenu } from "../shell/dmenu";
import { comboFromEvent, KeystrokeVisualizer, pushStroke, type Stroke } from "../shell/keystroke-visualizer";
import { Osd } from "../shell/osd";
import { ScaleToFit } from "../theme/theme-generator";
import { AppContent, APPS, type AppId } from "./apps";
import { ANIMATIONS, CURVES, cssColour, LOOK, resolveAnim, type AnimLeaf, type Bezier, type HyprLook } from "./config";
import type { Rect } from "./dwindle";
import {
  BAR, DEFAULT_LAYOUT, H, SPECIAL, TOURS, W, bindFor, curWs, focused, initialState, parseCombo, rectsOf, reduce,
  type Action, type Geo, type Layout, type State, type Step, type Win, type WsKey,
} from "./compositor-state";

export { DEFAULT_LAYOUT, TOURS, bindFor, type Layout, type Step } from "./compositor-state";

// ───────── component ─────────

export interface CompositorProps {
  /** Overrides on the window look from hyprland.lua (gaps, borders, shadow, blur, dim…). */
  look?: Partial<HyprLook>;
  animations?: Record<string, AnimLeaf>;
  curves?: Record<string, Bezier>;
  /** Slow motion: 2 = everything twice as long. */
  timeScale?: number;
  /** Windows per workspace at start. */
  windows?: Layout;
  workspace?: number;
  /**
   * `implied`: plain keys act as if SUPER were held (your real Hyprland grabs SUPER before
   * the browser sees it). `super`: require the real SUPER key, for use outside Hyprland.
   */
  modifier?: "implied" | "super";
  /** Play a scripted tour, looping. Pressing any key takes over. */
  tour?: keyof typeof TOURS | Step[] | null;
  /** Show the keystroke visualizer. */
  showKeys?: boolean;
  /** Show the tour's captions. */
  captions?: boolean;
  /** Virtual px per resize press (Hyprland: 5 px per key repeat). */
  resizeStep?: number;
  className?: string;
}

/**
 * A keyboard-driven Hyprland: dwindle tiling, your binds from hyprland.lua, and the
 * animations, curves, borders, gaps, shadow, blur and dimming from its config.
 */
export function Compositor({
  look: lookOverride,
  animations = ANIMATIONS,
  curves = CURVES,
  timeScale = 1,
  windows = DEFAULT_LAYOUT,
  workspace = 1,
  modifier = "implied",
  tour = null,
  showKeys = true,
  captions = true,
  resizeStep = 40,
  className,
}: CompositorProps) {
  const look: HyprLook = { ...LOOK, ...lookOverride };
  const area: Rect = { x: look.gapsOut, y: BAR + look.gapsOut, w: W - look.gapsOut * 2, h: H - BAR - look.gapsOut * 2 };
  const geo: Geo = { area, gapsIn: look.gapsIn, resizeStep };
  const geoRef = useRef(geo);
  geoRef.current = geo;
  const [state, dispatch] = useReducer((s: State, a: Action) => reduce(s, a, geoRef.current), undefined, () => initialState(windows, workspace, geo));
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [caption, setCaption] = useState<string | null>(null);
  const [playing, setPlaying] = useState(tour !== null);
  const [prevTour, setPrevTour] = useState(tour);
  if (prevTour !== tour) {
    setPrevTour(tour);
    setPlaying(tour !== null);
  }
  const root = useRef<HTMLDivElement>(null);

  const anim = (leaf: string) => resolveAnim(leaf, animations, curves, timeScale);
  const press = (combo: string[], at: number) => {
    setStrokes((s) => pushStroke(s, combo, at));
    const action = bindFor(combo);
    if (action) dispatch(action);
    return action !== null;
  };

  // Scripted tour: one step per timeout, looping from a fresh layout.
  useEffect(() => {
    if (!playing || !tour) return;
    const steps = typeof tour === "string" ? TOURS[tour]! : tour;
    let i = 0, timer = 0;
    const run = () => {
      if (i === steps.length) {
        i = 0;
        dispatch({ type: "reset", state: initialState(windows, workspace, geoRef.current) });
        setStrokes([]);
        timer = window.setTimeout(run, 800 * timeScale);
        return;
      }
      const step = steps[i++]!;
      if (step.say) setCaption(step.say);
      if (step.keys) press(parseCombo(step.keys), performance.now());
      if (step.launch) dispatch({ type: "open", app: step.launch });
      timer = window.setTimeout(run, (step.wait ?? 900) * timeScale);
    };
    timer = window.setTimeout(run, 600);
    return () => window.clearTimeout(timer);
    // `press` only dispatches; restarting on its identity would restart the tour every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, tour, timeScale, windows, workspace]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (state.launcher) {
      if (e.key === "Escape") {
        dispatch({ type: "launcher", open: false });
        root.current?.focus();
      }
      return;
    }
    const raw = comboFromEvent(e);
    if (!raw) return;
    if (playing) {
      setPlaying(false);
      setCaption(null);
    }
    let combo = raw;
    if (modifier === "implied") {
      const named = raw.at(-1)!;
      const mediaKey = /^(VOL|MUTE)/.test(named);
      combo = raw.includes("SUPER") || mediaKey || raw.includes("CTRL") ? raw : ["SUPER", ...raw];
    }
    if (press(combo, e.timeStamp)) e.preventDefault();
  };

  const winMove = anim("windowsMove"), winIn = anim("windowsIn"), winOut = anim("windowsOut");
  const border = anim("border"), angle = anim("borderangle"), dim = anim("fadeDim"), fade = anim("fade");
  const ws = anim("workspaces"), special = anim("specialWorkspace"), layersIn = anim("layersIn");

  const vars = {
    "--rx-hw-border": `${look.borderSize}px`,
    "--rx-hw-radius": `${look.rounding}px`,
    // Stops only: the gradient itself is built on the edge element, where --rx-hw-angle animates.
    "--rx-hw-stops": (look.activeBorder.colours.length > 1 ? look.activeBorder.colours : [...look.activeBorder.colours, ...look.activeBorder.colours]).map(cssColour).join(", "),
    "--rx-hw-inactive": cssColour(look.inactiveBorder),
    "--rx-hw-move": `${winMove.ms}ms ${winMove.easing}`,
    "--rx-hw-in": `${winIn.ms}ms ${winIn.easing}`,
    "--rx-hw-out": `${winOut.ms}ms ${winOut.easing}`,
    "--rx-hw-border-t": `${border.ms}ms ${border.easing}`,
    "--rx-hw-angle-anim": angle.ms && angle.style?.startsWith("loop") ? `rx-hw-angle ${angle.ms}ms linear infinite` : "none",
    "--rx-hw-angle-0": `${look.activeBorder.angle}deg`,
    "--rx-hw-dim-t": `${dim.ms}ms ${dim.easing}`,
    "--rx-hw-fade-t": `${fade.ms}ms ${fade.easing}`,
    "--rx-hw-shadow": look.shadow.enabled ? `0 0 ${look.shadow.range * 1.4}px ${look.shadow.range / (look.shadow.renderPower + 1)}px ${cssColour(look.shadow.colour)}` : "none",
    "--rx-hw-shadow-off": look.shadow.enabled ? `0 0 ${look.shadow.range * 1.4}px ${look.shadow.range / (look.shadow.renderPower + 1)}px ${cssColour(look.shadow.colourInactive)}` : "none",
    "--rx-hw-blur": look.blur.enabled
      ? `blur(${look.blur.size * look.blur.passes * 0.8}px) brightness(${look.blur.brightness}) contrast(${look.blur.contrast}) saturate(${1 + look.blur.vibrancy})`
      : "none",
    "--rx-hw-opacity": look.inactiveOpacity,
    "--rx-hw-opacity-on": look.activeOpacity,
    "--rx-hw-dim": look.dimInactive ? look.dimStrength : 0,
    "--rx-hw-ws": `${ws.ms}ms ${ws.easing}`,
    "--rx-hw-special": `${special.ms}ms ${special.easing}`,
    "--rx-hw-special-dim": look.dimSpecial,
    "--rx-hw-layer": `${layersIn.ms}ms ${layersIn.easing}`,
  } as CSSProperties;

  const fwin = focused(state);
  const renderWs = (key: WsKey) => {
    const rects = rectsOf(state, key, geo);
    const list = Object.values(state.wins).filter((w) => w.ws === key);
    // Tiled first, then floating, focused float on top.
    list.sort((a, b) => Number(!!a.float) - Number(!!b.float) || Number(a.id === fwin) - Number(b.id === fwin));
    return list.map((w) => {
      const r = w.closing ?? rects.get(w.id);
      if (!r) return null;
      const isFocused = w.id === fwin && key === curWs(state);
      return (
        <HyprWindow
          key={w.id}
          win={w}
          rect={r}
          focused={isFocused}
          opened={w.id === state.opened}
          preselect={isFocused ? state.preselect : null}
          onFocus={() => !w.closing && dispatch({ type: "focusWin", id: w.id })}
          onClosed={() => dispatch({ type: "reap", id: w.id })}
        />
      );
    });
  };

  const step = state.slide;
  const layer = "absolute z-30 animate-[rx-layer-in_var(--rx-hw-layer)_both]";

  return (
    <div
      ref={root}
      tabIndex={0}
      data-component="Compositor"
      className={cx("relative ring ring-surface0 outline-none focus-visible:ring-2 focus-visible:ring-mauve", className)}
      onKeyDown={onKeyDown}
      aria-label="Hyprland simulator: focus and use your keybinds"
    >
      <ScaleToFit width={W} height={H}>
        <div className="relative h-[1080px] w-[1920px] overflow-hidden bg-crust font-hx text-text select-none" style={vars}>
          <Wallpaper variant="image" />
          <HyprBar state={state} onWorkspace={(n) => dispatch({ type: "workspace", n })} />
          <div className="absolute inset-0 overflow-hidden">
            {step && (
              <div
                key={`out${step.n}`}
                className="pointer-events-none absolute inset-0 animate-[rx-ws-out_var(--rx-hw-ws)_both]"
                style={{ "--rx-dir": step.dir } as CSSProperties}
                onAnimationEnd={(e) => e.target === e.currentTarget && dispatch({ type: "slideDone", n: step.n })}
              >
                {renderWs(String(step.from))}
              </div>
            )}
            <div
              key={`in${state.active}`}
              className={cx("absolute inset-0", step && "animate-[rx-ws-in_var(--rx-hw-ws)_both]")}
              style={{ "--rx-dir": step?.dir ?? 1 } as CSSProperties}
            >
              {renderWs(String(state.active))}
            </div>
            <div
              className={cx(
                "pointer-events-none absolute inset-0 z-8 bg-black [transition:opacity_var(--rx-hw-special)]",
                state.special ? "opacity-(--rx-hw-special-dim)" : "opacity-0",
              )}
            />
            {/* The scratchpad slides down from above; `transform` (not `translate`) so the transition runs. */}
            <div
              className={cx(
                "absolute inset-0 z-9 [transition:transform_var(--rx-hw-special)]",
                state.special ? "pointer-events-auto [transform:none]" : "pointer-events-none [transform:translateY(-105%)]",
              )}
            >
              {renderWs(SPECIAL)}
            </div>
          </div>
          {state.launcher && (
            <div className={cx(layer, "top-[22%] left-1/2 -translate-x-1/2 shadow-popup")}>
              <Dmenu
                lines={8}
                prompt="drun"
                width={560}
                autoFocus
                items={Object.keys(APPS)}
                onSelect={(app) => {
                  dispatch({ type: "open", app: app as AppId });
                  root.current?.focus();
                }}
              />
            </div>
          )}
          {state.osd && (
            <div
              key={state.osd.n}
              className={cx(layer, "bottom-24 left-1/2 -translate-x-1/2 animate-[rx-layer-in_var(--rx-hw-layer)_both,rx-layer-out_.4s_linear_1.4s_forwards]")}
            >
              <Osd kind={state.osd.kind} value={state.osd.value} muted={state.osd.muted} />
            </div>
          )}
          {state.notice && (
            <div
              key={state.notice.n}
              className={cx(
                layer,
                "top-[70px] left-1/2 flex -translate-x-1/2 items-center gap-2.5 border-l-3 border-red bg-mantle px-[18px] py-3 text-[14px] shadow-popup",
                "animate-[rx-layer-in_var(--rx-hw-layer)_both,rx-layer-out_.4s_linear_2.2s_forwards]",
              )}
            >
              <Icon name="logout" size={18} className="text-red" /> {state.notice.text}
            </div>
          )}
          {captions && caption && playing && (
            <div className="absolute bottom-6 left-6 z-40 max-w-[900px] animate-[hx-fade_.3s_both] border-l-3 border-mauve bg-crust/86 px-4 py-2.5 text-[18px] backdrop-blur-[10px]">
              {caption}
            </div>
          )}
          {showKeys && (
            <KeystrokeVisualizer
              strokes={strokes}
              className="absolute right-6 bottom-6 z-40 [zoom:1.35]"
              placeholder={modifier === "implied" ? "click here, then h j k l, ⏎, 1–9 … (SUPER is implied)" : "click here, then use your binds"}
            />
          )}
        </div>
      </ScaleToFit>
    </div>
  );
}

/** The waybar layer: workspaces, focused title, preselect / scratchpad / volume chips, clock. */
function HyprBar({ state, onWorkspace }: { state: State; onWorkspace: (n: number) => void }) {
  const fwin = focused(state);
  const wsList = Array.from({ length: 10 }, (_, i) => i + 1);
  // Like waybar's hyprland/workspaces: only workspaces with windows, plus the focused one even when empty.
  const occupied = wsList.filter((n) => n === state.active || Object.values(state.wins).some((w) => w.ws === String(n) && !w.closing));
  const chip = "inline-flex h-6 items-center gap-1.5 bg-surface0 px-2.5";
  return (
    <div
      data-component="HyprBar"
      className="absolute inset-x-0 top-0 z-20 flex h-[35px] items-center gap-3 border-b border-surface0 bg-crust/78 px-2.5 text-[12.5px] backdrop-blur-[14px]"
    >
      <Icon name="arch" size={16} className="text-blue" />
      <Workspaces
        active={state.active}
        workspaces={occupied.map((n) => ({ id: n, apps: [...new Set(Object.values(state.wins).filter((w) => w.ws === String(n) && !w.closing).map((w) => APPS[w.app].icon))] }))}
        showApps
        onSelect={onWorkspace}
      />
      <span className="max-w-[520px] truncate text-subtext0">{fwin ? APPS[state.wins[fwin]!.app].title : ""}</span>
      <span className="flex-1" />
      {state.preselect && <span className={chip}>preselect {state.preselect === "d" ? "↓" : "→"}</span>}
      {state.special && <span className={chip}>special:magic</span>}
      <span className={chip}>
        <Icon name={state.muted ? "volumeOff" : "volumeHigh"} size={14} /> {state.muted ? "muted" : `${state.volume}%`}
      </span>
      <span className="px-1.5 font-bold">21:41</span>
    </div>
  );
}

interface HyprWindowProps {
  win: Win;
  rect: Rect;
  focused: boolean;
  /** Just opened: play the pop-in. */
  opened: boolean;
  preselect: "d" | "r" | null;
  onFocus: () => void;
  /** The close animation finished. */
  onClosed: () => void;
}

// Blur, body and dim sit inside the border; the border itself is two masked edges that cross-fade on focus.
const inner = "absolute inset-(--rx-hw-border) rounded-[max(0px,calc(var(--rx-hw-radius)_-_var(--rx-hw-border)))]";
const edge =
  "pointer-events-none absolute inset-0 rounded-[var(--rx-hw-radius)] p-(--rx-hw-border) [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]";

/** One client, decorated from the --rx-hw-* look variables (border, rounding, shadow, blur, opacity, dim). */
function HyprWindow({ win: w, rect: r, focused: on, opened, preselect, onFocus, onClosed }: HyprWindowProps) {
  const app = APPS[w.app];
  const fade = cx("[transition:opacity_var(--rx-hw-fade-t)]", on ? "opacity-(--rx-hw-opacity-on)" : "opacity-(--rx-hw-opacity)");
  return (
    <div
      data-component="HyprWindow"
      className={cx(
        "absolute rounded-[var(--rx-hw-radius)]",
        "[transition:left_var(--rx-hw-move),top_var(--rx-hw-move),width_var(--rx-hw-move),height_var(--rx-hw-move),box-shadow_var(--rx-hw-border-t)]",
        on ? "z-2 [box-shadow:var(--rx-hw-shadow)]" : "[box-shadow:var(--rx-hw-shadow-off)]",
        w.float && (on ? "z-4" : "z-3"),
        opened && "animate-[rx-hw-in_var(--rx-hw-in)_both]",
        w.closing && "pointer-events-none z-1 animate-[rx-hw-out_var(--rx-hw-out)_forwards]",
      )}
      style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
      onMouseDown={onFocus}
      onAnimationEnd={(e: AnimationEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && w.closing) onClosed();
      }}
    >
      <div className={cx(inner, fade, "bg-base/82 [backdrop-filter:var(--rx-hw-blur)]")} />
      <div className={cx(inner, fade, "overflow-hidden")} title={`${app.cls} — ${app.title}`}>
        <AppContent app={w.app} />
      </div>
      <div
        className={cx(inner, "pointer-events-none bg-black [transition:opacity_var(--rx-hw-dim-t)]", on ? "opacity-0" : "opacity-(--rx-hw-dim)")}
      />
      <div className={cx(edge, "bg-(--rx-hw-inactive)")} />
      <div
        className={cx(
          edge,
          "bg-[linear-gradient(var(--rx-hw-angle),var(--rx-hw-stops))] [animation:var(--rx-hw-angle-anim)] [transition:opacity_var(--rx-hw-border-t)] [--rx-hw-angle:var(--rx-hw-angle-0)]",
          on ? "opacity-100" : "opacity-0",
        )}
      />
      {preselect && (
        <div
          className={cx(
            "pointer-events-none absolute animate-[hx-fade_.2s_both] bg-mauve/14 outline-2 -outline-offset-8 outline-mauve outline-dashed",
            preselect === "d" ? "inset-x-0 top-1/2 bottom-0" : "inset-y-0 right-0 left-1/2",
          )}
        />
      )}
    </div>
  );
}
