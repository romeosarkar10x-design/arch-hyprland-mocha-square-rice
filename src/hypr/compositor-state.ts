// The compositor's window manager: state, the reducer behind every bind, the keymap from
// hyprland.lua and the scripted tours. Pure, so it can be tested without a DOM.
import type { AppId } from "./apps";
import { insert, layout, leaves, neighbour, remove, resize, swap, type Direction, type Rect, type Tree } from "./dwindle";

export const W = 1920,
  H = 1080,
  BAR = 34;
export const SPECIAL = "special";
export type WsKey = string; // "1".."10" | "special"

export interface Win {
  id: string;
  app: AppId;
  ws: WsKey;
  /** Set while floating. */
  float?: Rect;
  /** Set while playing the close animation: where it was. */
  closing?: Rect;
}

export interface State {
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

export interface Geo {
  area: Rect;
  gapsIn: number;
  resizeStep: number;
}

export type Action =
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

export const curWs = (s: State): WsKey => (s.special ? SPECIAL : String(s.active));
export const focused = (s: State) => s.focus[curWs(s)] ?? null;

export function rectsOf(s: State, ws: WsKey, g: Geo): Map<string, Rect> {
  const rects = layout(s.trees[ws] ?? null, specialArea(ws, g.area), g.gapsIn);
  for (const w of Object.values(s.wins)) if (w.ws === ws && w.float && !w.closing) rects.set(w.id, w.float);
  return rects;
}

/** The scratchpad sits inset from the screen edges, like Hyprland draws special workspaces. */
const specialArea = (ws: WsKey, a: Rect): Rect => (ws === SPECIAL ? { x: a.x + 120, y: a.y + 70, w: a.w - 240, h: a.h - 140 } : a);

function detach(s: State, id: string, g: Geo): State {
  const w = s.wins[id]!;
  const tree = remove(s.trees[w.ws] ?? null, id);
  const rest = [
    ...leaves(tree),
    ...Object.values(s.wins)
      .filter((x) => x.ws === w.ws && x.float && x.id !== id && !x.closing)
      .map((x) => x.id),
  ];
  // Focus goes to the window that took its place, like Hyprland's fallback.
  const before = rectsOf(s, w.ws, g).get(id);
  const after = layout(tree, specialArea(w.ws, g.area), g.gapsIn);
  let next: string | null = rest.at(-1) ?? null;
  if (before) {
    for (const [other, r] of after)
      if (r.x <= before.x + before.w / 2 && r.x + r.w >= before.x + before.w / 2 && r.y <= before.y + before.h / 2 && r.y + r.h >= before.y + before.h / 2)
        next = other;
  }
  return { ...s, trees: { ...s.trees, [w.ws]: tree }, focus: { ...s.focus, [w.ws]: s.focus[w.ws] === id ? next : s.focus[w.ws]! } };
}

function attach(s: State, id: string, ws: WsKey, g: Geo): State {
  const tree = insert(s.trees[ws] ?? null, s.focus[ws] ?? null, id, specialArea(ws, g.area), g.gapsIn, s.preselect);
  return {
    ...s,
    preselect: null,
    trees: { ...s.trees, [ws]: tree },
    focus: { ...s.focus, [ws]: id },
    wins: { ...s.wins, [id]: { ...s.wins[id]!, ws, float: undefined } },
  };
}

function goTo(s: State, n: number): State {
  if (n === s.active) return { ...s, special: false };
  return { ...s, special: false, opened: null, active: n, slide: { from: s.active, dir: n > s.active ? 1 : -1, n: s.seq + 1 }, seq: s.seq + 1 };
}

export function reduce(s: State, a: Action, g: Geo): State {
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
      const ws = curWs(s),
        step = g.resizeStep;
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
      const w = s.wins[f]!,
        ws = curWs(s);
      if (w.float) return attach({ ...s, wins: { ...s.wins, [f]: { ...w, float: undefined } } }, f, ws, g);
      const r = rectsOf(s, ws, g).get(f)!;
      const fw = Math.min(r.w, g.area.w * 0.5),
        fh = Math.min(Math.max(r.h, 420), g.area.h * 0.6);
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

export function initialState(windows: Layout, active: number, g: Geo): State {
  let s: State = {
    wins: {},
    trees: {},
    focus: {},
    active,
    special: false,
    slide: null,
    preselect: null,
    launcher: false,
    osd: null,
    volume: 45,
    muted: false,
    mic: true,
    notice: null,
    opened: null,
    seq: 0,
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

export const parseCombo = (keys: string) => keys.split("+");
