import { useEffect, useReducer, useRef, useState, type AnimationEvent, type CSSProperties, type KeyboardEvent } from "react";
import { Icon, Wallpaper, Workspaces } from "../ds";
import { Dmenu } from "../shell/Dmenu";
import { comboFromEvent, KeystrokeVisualizer, pushStroke, type Stroke } from "../shell/KeystrokeVisualizer";
import { Osd } from "../shell/Osd";
import { ScaleToFit } from "../theme/ThemeGenerator";
import { AppContent, APPS, type AppId } from "./apps";
import { ANIMATIONS, CURVES, cssColour, LOOK, resolveAnim, type AnimLeaf, type Bezier, type HyprLook } from "./config";
import { insert, layout, leaves, neighbour, remove, resize, swap, type Direction, type Rect, type Tree } from "./dwindle";
import "./hypr.css";

const W = 1920, H = 1080, BAR = 34;
const SPECIAL = "special";
type WsKey = string; // "1".."10" | "special"

interface Win {
  id: string;
  app: AppId;
  ws: WsKey;
  /** Set while floating. */
  float?: Rect;
  /** Set while playing the close animation: where it was. */
  closing?: Rect;
}

interface State {
  wins: Record<string, Win>;
  trees: Record<WsKey, Tree | null>;
  focus: Record<WsKey, string | null>;
  active: number;
  special: boolean;
  /** The workspace sliding out, while a switch animates. */
  slide: { from: number; dir: 1 | -1; n: number } | null;
  preselect: "d" | "r" | null;
  launcher: boolean;
  osd: { kind: "volume" | "mic"; value: number; muted: boolean; n: number } | null;
  volume: number;
  muted: boolean;
  mic: boolean;
  notice: { text: string; n: number } | null;
  /** The window just opened: only it plays the pop-in (not windows remounted by a workspace switch). */
  opened: string | null;
  seq: number;
}

interface Geo {
  area: Rect;
  gapsIn: number;
  resizeStep: number;
}

type Action =
  | { type: "open"; app: AppId }
  | { type: "close" }
  | { type: "reap"; id: string }
  | { type: "focusDir"; dir: Direction }
  | { type: "swapDir"; dir: Direction }
  | { type: "resize"; dir: Direction }
  | { type: "preselect"; side: "d" | "r" }
  | { type: "workspace"; n: number }
  | { type: "moveTo"; ws: WsKey }
  | { type: "toggleSpecial" }
  | { type: "toggleFloat" }
  | { type: "launcher"; open: boolean }
  | { type: "slideDone"; n: number }
  | { type: "media"; key: "up" | "down" | "mute" | "mic" }
  | { type: "notice"; text: string }
  | { type: "focusWin"; id: string }
  | { type: "reset"; state: State };

const DIRS: Record<string, Direction> = { H: "left", J: "down", K: "up", L: "right" };

const curWs = (s: State): WsKey => (s.special ? SPECIAL : String(s.active));
const focused = (s: State) => s.focus[curWs(s)] ?? null;

function rectsOf(s: State, ws: WsKey, g: Geo): Map<string, Rect> {
  const rects = layout(s.trees[ws] ?? null, specialArea(ws, g.area), g.gapsIn);
  for (const w of Object.values(s.wins)) if (w.ws === ws && w.float && !w.closing) rects.set(w.id, w.float);
  return rects;
}

/** The scratchpad sits inset from the screen edges, like Hyprland draws special workspaces. */
const specialArea = (ws: WsKey, a: Rect): Rect => (ws === SPECIAL ? { x: a.x + 120, y: a.y + 70, w: a.w - 240, h: a.h - 140 } : a);

function detach(s: State, id: string, g: Geo): State {
  const w = s.wins[id]!;
  const tree = remove(s.trees[w.ws] ?? null, id);
  const rest = [...leaves(tree), ...Object.values(s.wins).filter((x) => x.ws === w.ws && x.float && x.id !== id && !x.closing).map((x) => x.id)];
  // Focus goes to the window that took its place, like Hyprland's fallback.
  const before = rectsOf(s, w.ws, g).get(id);
  const after = layout(tree, specialArea(w.ws, g.area), g.gapsIn);
  let next: string | null = rest.at(-1) ?? null;
  if (before) {
    for (const [other, r] of after) if (r.x <= before.x + before.w / 2 && r.x + r.w >= before.x + before.w / 2 && r.y <= before.y + before.h / 2 && r.y + r.h >= before.y + before.h / 2) next = other;
  }
  return { ...s, trees: { ...s.trees, [w.ws]: tree }, focus: { ...s.focus, [w.ws]: s.focus[w.ws] === id ? next : s.focus[w.ws]! } };
}

function attach(s: State, id: string, ws: WsKey, g: Geo): State {
  const tree = insert(s.trees[ws] ?? null, s.focus[ws] ?? null, id, specialArea(ws, g.area), g.gapsIn, s.preselect);
  return { ...s, preselect: null, trees: { ...s.trees, [ws]: tree }, focus: { ...s.focus, [ws]: id }, wins: { ...s.wins, [id]: { ...s.wins[id]!, ws, float: undefined } } };
}

function goTo(s: State, n: number): State {
  if (n === s.active) return { ...s, special: false };
  return { ...s, special: false, opened: null, active: n, slide: { from: s.active, dir: n > s.active ? 1 : -1, n: s.seq + 1 }, seq: s.seq + 1 };
}

function reduce(s: State, a: Action, g: Geo): State {
  const f = focused(s);
  switch (a.type) {
    case "open": {
      const id = `w${s.seq + 1}`;
      const withWin = { ...s, seq: s.seq + 1, launcher: false, opened: id, wins: { ...s.wins, [id]: { id, app: a.app, ws: curWs(s) } } };
      return attach(withWin, id, curWs(s), g);
    }
    case "close": {
      if (!f) return s;
      const r = rectsOf(s, curWs(s), g).get(f)!;
      const next = detach(s, f, g);
      return { ...next, wins: { ...next.wins, [f]: { ...next.wins[f]!, closing: r, float: undefined } } };
    }
    case "reap": {
      const wins = { ...s.wins };
      delete wins[a.id];
      return { ...s, wins };
    }
    case "focusDir": {
      if (!f) return s;
      const to = neighbour(rectsOf(s, curWs(s), g), f, a.dir);
      return to ? { ...s, focus: { ...s.focus, [curWs(s)]: to } } : s;
    }
    case "focusWin":
      return { ...s, focus: { ...s.focus, [s.wins[a.id]!.ws]: a.id } };
    case "swapDir": {
      if (!f || s.wins[f]!.float) return s;
      const ws = curWs(s);
      const to = neighbour(layout(s.trees[ws] ?? null, specialArea(ws, g.area), g.gapsIn), f, a.dir);
      return to ? { ...s, trees: { ...s.trees, [ws]: swap(s.trees[ws] ?? null, f, to) } } : s;
    }
    case "resize": {
      if (!f) return s;
      const ws = curWs(s), step = g.resizeStep;
      const dx = a.dir === "left" ? -step : a.dir === "right" ? step : 0;
      const dy = a.dir === "up" ? -step : a.dir === "down" ? step : 0;
      const w = s.wins[f]!;
      if (w.float) {
        const r = w.float;
        return { ...s, wins: { ...s.wins, [f]: { ...w, float: { ...r, w: Math.max(240, r.w + dx), h: Math.max(160, r.h + dy) } } } };
      }
      return { ...s, trees: { ...s.trees, [ws]: resize(s.trees[ws] ?? null, f, dx, dy, specialArea(ws, g.area), g.gapsIn) } };
    }
    case "preselect":
      return { ...s, preselect: s.preselect === a.side ? null : a.side };
    case "workspace":
      return goTo(s, a.n);
    case "moveTo": {
      if (!f) return a.ws === SPECIAL ? s : goTo(s, Number(a.ws));
      if (a.ws === curWs(s)) return s;
      const moved = attach({ ...detach(s, f, g), preselect: null }, f, a.ws, g);
      return a.ws === SPECIAL ? { ...moved, special: true } : goTo(moved, Number(a.ws));
    }
    case "toggleSpecial":
      return { ...s, special: !s.special };
    case "toggleFloat": {
      if (!f) return s;
      const w = s.wins[f]!, ws = curWs(s);
      if (w.float) return attach({ ...s, wins: { ...s.wins, [f]: { ...w, float: undefined } } }, f, ws, g);
      const r = rectsOf(s, ws, g).get(f)!;
      const fw = Math.min(r.w, g.area.w * 0.5), fh = Math.min(Math.max(r.h, 420), g.area.h * 0.6);
      const next = detach(s, f, g);
      const float = { x: g.area.x + (g.area.w - fw) / 2, y: g.area.y + (g.area.h - fh) / 2, w: fw, h: fh };
      return { ...next, focus: { ...next.focus, [ws]: f }, wins: { ...next.wins, [f]: { ...w, float } } };
    }
    case "launcher":
      return { ...s, launcher: a.open };
    case "slideDone":
      return s.slide?.n === a.n ? { ...s, slide: null } : s;
    case "media": {
      if (a.key === "mic") return { ...s, mic: !s.mic, osd: { kind: "mic", value: 100, muted: s.mic, n: s.seq + 1 }, seq: s.seq + 1 };
      const muted = a.key === "mute" ? !s.muted : false;
      const volume = a.key === "up" ? Math.min(100, s.volume + 5) : a.key === "down" ? Math.max(0, s.volume - 5) : s.volume;
      return { ...s, volume, muted, osd: { kind: "volume", value: volume, muted, n: s.seq + 1 }, seq: s.seq + 1 };
    }
    case "notice":
      return { ...s, notice: { text: a.text, n: s.seq + 1 }, seq: s.seq + 1 };
    case "reset":
      return a.state;
  }
}

export type Layout = Partial<Record<number | "special", AppId[]>>;

export const DEFAULT_LAYOUT: Layout = { 1: ["fastfetch", "nvim", "btop"], 2: ["firefox", "yazi"], 4: ["dolphin"], special: ["ghostty"] };

function initialState(windows: Layout, active: number, g: Geo): State {
  let s: State = {
    wins: {}, trees: {}, focus: {}, active, special: false, slide: null, preselect: null, launcher: false,
    osd: null, volume: 45, muted: false, mic: true, notice: null, opened: null, seq: 0,
  };
  for (const [ws, apps] of Object.entries(windows)) {
    for (const app of apps ?? []) {
      const id = `w${s.seq + 1}`;
      s = attach({ ...s, seq: s.seq + 1, wins: { ...s.wins, [id]: { id, app, ws } } }, id, ws, g);
    }
  }
  return s;
}

// ───────── keymap (from hyprland.lua) ─────────

/** Map a Hyprland combo (`SUPER+SHIFT+H`) to what the config binds it to. */
export function bindFor(combo: string[]): Action | null {
  const mods = new Set(combo.slice(0, -1));
  const key = combo.at(-1)!;
  const only = (...m: string[]) => mods.size === m.length && m.every((x) => mods.has(x));
  if (!mods.size) {
    if (key === "VOL+" || key === "XF86AudioRaiseVolume") return { type: "media", key: "up" };
    if (key === "VOL−" || key === "XF86AudioLowerVolume") return { type: "media", key: "down" };
    if (key === "MUTE" || key === "XF86AudioMute") return { type: "media", key: "mute" };
    if (key === "XF86AudioMicMute") return { type: "media", key: "mic" };
    return null;
  }
  if (only("SUPER")) {
    if (key === "RETURN") return { type: "open", app: "ghostty" };
    if (key === "X") return { type: "close" };
    if (key === "M") return { type: "notice", text: "hl.dsp.exit() — would log out of Hyprland" };
    if (key === "E") return { type: "open", app: "dolphin" };
    if (key === "V") return { type: "toggleFloat" };
    if (key === "SPACE") return { type: "launcher", open: true };
    if (key === "O") return { type: "preselect", side: "d" };
    if (key === "U") return { type: "preselect", side: "r" };
    if (key === "S") return { type: "toggleSpecial" };
    if (DIRS[key]) return { type: "focusDir", dir: DIRS[key] };
    if (/^\d$/.test(key)) return { type: "workspace", n: Number(key) || 10 };
  }
  if (only("SUPER", "SHIFT")) {
    if (DIRS[key]) return { type: "swapDir", dir: DIRS[key] };
    if (/^\d$/.test(key)) return { type: "moveTo", ws: String(Number(key) || 10) };
    if (key === "S") return { type: "moveTo", ws: SPECIAL };
  }
  if (only("SUPER", "ALT") && DIRS[key]) return { type: "resize", dir: DIRS[key] };
  return null;
}

// ───────── scripted tours ─────────

export interface Step {
  /** A combo as Hyprland writes it: `SUPER+SHIFT+H`. */
  keys?: string;
  /** Pick this app in the open launcher. */
  launch?: AppId;
  /** Pause after this step, ms (before time scaling). */
  wait?: number;
  /** Caption shown while this step plays. */
  say?: string;
}

const k = (keys: string, wait = 900, say?: string): Step => ({ keys, wait, say });

export const TOURS: Record<string, Step[]> = {
  tiling: [
    k("SUPER+RETURN", 1100, "Open terminals: dwindle splits the focused window along its longer side"),
    k("SUPER+RETURN", 1100),
    k("SUPER+H", 700, "Move focus with SUPER + h j k l"),
    k("SUPER+K", 700),
    k("SUPER+L", 700),
    k("SUPER+J", 900),
    k("SUPER+SHIFT+H", 1000, "Swap windows with SUPER + SHIFT + h j k l"),
    k("SUPER+SHIFT+L", 1000),
    k("SUPER+ALT+L", 260, "Resize with SUPER + ALT + h j k l (repeats while held)"),
    k("SUPER+ALT+L", 260),
    k("SUPER+ALT+L", 260),
    k("SUPER+ALT+L", 700),
    k("SUPER+ALT+J", 260),
    k("SUPER+ALT+J", 900),
    k("SUPER+O", 600, "Preselect: the next window opens below"),
    k("SUPER+RETURN", 1100),
    k("SUPER+V", 1200, "Float it, then tile it again"),
    k("SUPER+V", 1000),
    k("SUPER+X", 700, "Close with SUPER + X"),
    k("SUPER+X", 700),
    k("SUPER+X", 1200),
  ],
  workspaces: [
    k("SUPER+2", 1100, "Switch workspaces: slide, easeOutQuint, 300 ms"),
    k("SUPER+3", 900),
    k("SUPER+RETURN", 900, "An empty workspace gets a fresh terminal"),
    k("SUPER+1", 1100),
    k("SUPER+SHIFT+3", 1300, "Send the focused window to workspace 3 (focus follows)"),
    k("SUPER+4", 1000),
    k("SUPER+1", 1000),
    k("SUPER+S", 1300, "Scratchpad: special workspace slides in vertically"),
    k("SUPER+S", 1000),
    k("SUPER+SHIFT+S", 1300, "Stash the focused window in the scratchpad"),
    k("SUPER+S", 1100),
    k("SUPER+SPACE", 900, "Launcher (wofi)"),
    { launch: "firefox", wait: 1100 },
    k("SUPER+E", 1200, "File manager"),
    k("XF86AudioRaiseVolume", 250, "Media keys show an OSD"),
    k("XF86AudioRaiseVolume", 250),
    k("XF86AudioRaiseVolume", 900),
    k("XF86AudioMute", 1300),
  ],
};
TOURS.everything = [...TOURS.tiling!, ...TOURS.workspaces!];

const parseCombo = (keys: string) => keys.split("+");

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
      const app = APPS[w.app];
      return (
        <div
          key={w.id}
          className={["rx-hw", w.id === state.opened && "is-new", isFocused && "is-focused", w.closing && "is-closing", w.float && "is-float"].filter(Boolean).join(" ")}
          style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
          onMouseDown={() => !w.closing && dispatch({ type: "focusWin", id: w.id })}
          onAnimationEnd={(e: AnimationEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget && w.closing) dispatch({ type: "reap", id: w.id });
          }}
        >
          <div className="rx-hw-blur" />
          <div className="rx-hw-body" title={`${app.cls} — ${app.title}`}>
            <AppContent app={w.app} />
          </div>
          <div className="rx-hw-dim" />
          <div className="rx-hw-edge rx-hw-edge--off" />
          <div className="rx-hw-edge rx-hw-edge--on" />
          {isFocused && state.preselect && <div className={`rx-hw-pre rx-hw-pre--${state.preselect}`} />}
        </div>
      );
    });
  };

  const wsList = Array.from({ length: 10 }, (_, i) => i + 1);
  const occupied = wsList.filter((n) => n <= 5 || n === state.active || Object.values(state.wins).some((w) => w.ws === String(n)));
  const step = state.slide;

  return (
    <div
      ref={root}
      tabIndex={0}
      className={["rx-comp", className].filter(Boolean).join(" ")}
      onKeyDown={onKeyDown}
      aria-label="Hyprland simulator: focus and use your keybinds"
    >
      <ScaleToFit width={W} height={H}>
        <div className="rx-hyp" style={vars}>
          <Wallpaper variant="image" />
          <div className="rx-hyp-bar">
            <Icon name="arch" size={16} className="hx-blue" />
            <Workspaces
              active={state.active}
              workspaces={occupied.map((n) => ({ id: n, apps: [...new Set(Object.values(state.wins).filter((w) => w.ws === String(n) && !w.closing).map((w) => APPS[w.app].icon))] }))}
              showApps
              onSelect={(n) => dispatch({ type: "workspace", n })}
            />
            <span className="rx-hyp-title">{fwin ? APPS[state.wins[fwin]!.app].title : ""}</span>
            <span className="hx-spacer" />
            {state.preselect && <span className="rx-hyp-chip">preselect {state.preselect === "d" ? "↓" : "→"}</span>}
            {state.special && <span className="rx-hyp-chip">special:magic</span>}
            <span className="rx-hyp-chip">
              <Icon name={state.muted ? "volumeOff" : "volumeHigh"} size={14} /> {state.muted ? "muted" : `${state.volume}%`}
            </span>
            <span className="rx-hyp-clock">21:41</span>
          </div>
          <div className="rx-hyp-stage">
            {step && (
              <div
                key={`out${step.n}`}
                className="rx-hyp-ws rx-hyp-ws--out"
                style={{ "--rx-dir": step.dir } as CSSProperties}
                onAnimationEnd={(e) => e.target === e.currentTarget && dispatch({ type: "slideDone", n: step.n })}
              >
                {renderWs(String(step.from))}
              </div>
            )}
            <div key={`in${state.active}`} className={["rx-hyp-ws", step && "rx-hyp-ws--in"].filter(Boolean).join(" ")} style={{ "--rx-dir": step?.dir ?? 1 } as CSSProperties}>
              {renderWs(String(state.active))}
            </div>
            <div className={["rx-hyp-special-dim", state.special && "is-on"].filter(Boolean).join(" ")} />
            <div className={["rx-hyp-ws rx-hyp-special", state.special && "is-on"].filter(Boolean).join(" ")}>{renderWs(SPECIAL)}</div>
          </div>
          {state.launcher && (
            <div className="rx-hyp-layer rx-hyp-launch">
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
            <div key={state.osd.n} className="rx-hyp-layer rx-hyp-osd">
              <Osd kind={state.osd.kind} value={state.osd.value} muted={state.osd.muted} />
            </div>
          )}
          {state.notice && (
            <div key={state.notice.n} className="rx-hyp-layer rx-hyp-notice">
              <Icon name="logout" size={18} className="hx-red" /> {state.notice.text}
            </div>
          )}
          {captions && caption && playing && <div className="rx-hyp-caption">{caption}</div>}
          {showKeys && <KeystrokeVisualizer strokes={strokes} className="rx-hyp-keys" placeholder={modifier === "implied" ? "click here, then h j k l, ⏎, 1–9 … (SUPER is implied)" : "click here, then use your binds"} />}
        </div>
      </ScaleToFit>
    </div>
  );
}
