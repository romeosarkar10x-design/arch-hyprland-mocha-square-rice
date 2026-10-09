// The rice's Hyprland config (~/.config/hypr/hyprland.lua, Hyprland 0.55+ Lua) as typed data.
// The window look, animation curves and keybinds below are transcribed from it, so the
// stories show the real setup; `hyprlandLua()` writes the look back out as Lua.
import type { Palette, Slot } from "../theme/palette";

/** A palette slot (`"mauve"`) with optional 2-digit hex alpha (`"surface0:cc"`), or a literal `#rrggbb`. */
export type ColourRef = Slot | `${Slot}:${string}` | `#${string}`;

export interface Gradient {
  colours: ColourRef[];
  /** Degrees, like `col.active_border = a b c 45deg`. */
  angle: number;
}

export interface HyprLook {
  gapsIn: number;
  gapsOut: number;
  borderSize: number;
  activeBorder: Gradient;
  inactiveBorder: ColourRef;
  rounding: number;
  activeOpacity: number;
  inactiveOpacity: number;
  dimInactive: boolean;
  dimStrength: number;
  dimSpecial: number;
  shadow: { enabled: boolean; range: number; renderPower: number; colour: ColourRef; colourInactive: ColourRef };
  blur: { enabled: boolean; size: number; passes: number; noise: number; contrast: number; brightness: number; vibrancy: number };
  group: { activeBorder: Gradient; inactiveBorder: ColourRef; barActive: ColourRef; barInactive: ColourRef; barHeight: number; barText: ColourRef };
}

export const LOOK: HyprLook = {
  gapsIn: 3,
  gapsOut: 6,
  borderSize: 2,
  activeBorder: { colours: ["mauve", "pink", "yellow"], angle: 45 },
  inactiveBorder: "surface0:cc",
  rounding: 0,
  activeOpacity: 1,
  inactiveOpacity: 0.94,
  dimInactive: true,
  dimStrength: 0.08,
  dimSpecial: 0.4,
  shadow: { enabled: true, range: 14, renderPower: 3, colour: "crust:dd", colourInactive: "crust:66" },
  blur: { enabled: true, size: 6, passes: 3, noise: 0.02, contrast: 1, brightness: 0.9, vibrancy: 0.17 },
  group: { activeBorder: { colours: ["peach", "yellow"], angle: 45 }, inactiveBorder: "surface1:cc", barActive: "mauve:dd", barInactive: "surface1:aa", barHeight: 18, barText: "crust" },
};

// ───────── animations ─────────

export type Bezier = [number, number, number, number];

export const CURVES: Record<string, Bezier> = {
  // Hyprland's built-in "default" curve.
  default: [0, 0.75, 0.15, 1],
  easeOutQuint: [0.23, 1, 0.32, 1],
  easeInOutCubic: [0.65, 0.05, 0.36, 1],
  linear: [0, 0, 1, 1],
  almostLinear: [0.5, 0.5, 0.75, 1],
  quick: [0.15, 0, 0.1, 1],
  overshot: [0.05, 0.9, 0.1, 1.05],
};

export interface AnimLeaf {
  enabled: boolean;
  /** Hyprland speed: 1 = 100 ms. */
  speed: number;
  bezier: string;
  style?: string;
}

export const ANIMATIONS: Record<string, AnimLeaf> = {
  global: { enabled: true, speed: 10, bezier: "default" },
  border: { enabled: true, speed: 5.39, bezier: "easeOutQuint" },
  borderangle: { enabled: true, speed: 60, bezier: "linear", style: "loop" },
  windows: { enabled: true, speed: 4.79, bezier: "easeOutQuint" },
  windowsIn: { enabled: true, speed: 4.1, bezier: "overshot", style: "popin 90%" },
  windowsOut: { enabled: true, speed: 1.49, bezier: "linear", style: "popin 90%" },
  windowsMove: { enabled: true, speed: 4, bezier: "easeOutQuint" },
  fadeIn: { enabled: true, speed: 1.73, bezier: "almostLinear" },
  fadeOut: { enabled: true, speed: 1.46, bezier: "almostLinear" },
  fade: { enabled: true, speed: 3.03, bezier: "quick" },
  fadeDim: { enabled: true, speed: 3, bezier: "easeOutQuint" },
  layers: { enabled: true, speed: 3.81, bezier: "easeOutQuint" },
  layersIn: { enabled: true, speed: 4, bezier: "easeOutQuint", style: "fade" },
  layersOut: { enabled: true, speed: 1.5, bezier: "linear", style: "fade" },
  fadeLayersIn: { enabled: true, speed: 1.79, bezier: "almostLinear" },
  fadeLayersOut: { enabled: true, speed: 1.39, bezier: "almostLinear" },
  workspaces: { enabled: true, speed: 3, bezier: "easeOutQuint", style: "slide" },
  specialWorkspace: { enabled: true, speed: 3, bezier: "easeOutQuint", style: "slidevert" },
  zoomFactor: { enabled: true, speed: 7, bezier: "quick" },
};

/** Hyprland's animation tree: a leaf without its own entry inherits from its parent. */
const PARENT: Record<string, string> = {
  windows: "global", windowsIn: "windows", windowsOut: "windows", windowsMove: "windows",
  layers: "global", layersIn: "layers", layersOut: "layers",
  fade: "global", fadeIn: "fade", fadeOut: "fade", fadeSwitch: "fade", fadeShadow: "fade", fadeDim: "fade",
  fadeLayers: "fade", fadeLayersIn: "fadeLayers", fadeLayersOut: "fadeLayers",
  border: "global", borderangle: "global", workspaces: "global", workspacesIn: "workspaces",
  workspacesOut: "workspaces", specialWorkspace: "workspaces", zoomFactor: "global",
};

export interface ResolvedAnim {
  ms: number;
  easing: string;
  style?: string;
}

export function resolveAnim(leaf: string, anims: Record<string, AnimLeaf> = ANIMATIONS, curves: Record<string, Bezier> = CURVES, timeScale = 1): ResolvedAnim {
  let name: string | undefined = leaf;
  while (name && !anims[name]) name = PARENT[name];
  const a = name ? anims[name]! : { enabled: true, speed: 10, bezier: "default" };
  const b = curves[a.bezier] ?? CURVES.default!;
  return { ms: a.enabled ? Math.round(a.speed * 100 * timeScale) : 0, easing: `cubic-bezier(${b.join(", ")})`, style: a.style };
}

// ───────── keybinds ─────────

export interface HyprBind {
  /** Keys as Hyprland names them: `SUPER + SHIFT + h`. */
  keys: string[];
  action: string;
  /** The Lua dispatcher it calls. */
  dispatch: string;
  /** `locked` (works on the lock screen), `repeating`, `mouse`. */
  flags?: string[];
}

export interface HyprBindGroup {
  title: string;
  binds: HyprBind[];
}

const DIRS = [
  ["h", "left"],
  ["j", "down"],
  ["k", "up"],
  ["l", "right"],
] as const;

export const BINDS: HyprBindGroup[] = [
  {
    title: "Apps",
    binds: [
      { keys: ["SUPER", "RETURN"], action: "Terminal (ghostty)", dispatch: 'hl.dsp.exec_cmd(terminal .. " 2>&1 | tee -a ~/term-error.log")' },
      { keys: ["SUPER", "SPACE"], action: "App launcher (wofi)", dispatch: 'hl.dsp.exec_cmd("wofi --show drun")' },
      { keys: ["SUPER", "E"], action: "File manager (dolphin)", dispatch: 'hl.dsp.exec_cmd("dolphin")' },
    ],
  },
  {
    title: "Windows",
    binds: [
      { keys: ["SUPER", "X"], action: "Close window", dispatch: "hl.dsp.window.close()" },
      { keys: ["SUPER", "V"], action: "Toggle floating", dispatch: 'hl.dsp.window.float({ action = "toggle" })' },
      ...DIRS.map(([k, d]): HyprBind => ({ keys: ["SUPER", k.toUpperCase()], action: `Focus ${d}`, dispatch: `hl.dsp.focus({ direction = "${d}" })` })),
      ...DIRS.map(([k, d]): HyprBind => ({ keys: ["SUPER", "SHIFT", k.toUpperCase()], action: `Swap ${d}`, dispatch: `hl.dsp.window.swap({ direction = "${d}" })` })),
      ...DIRS.map(([k, d]): HyprBind => ({
        keys: ["SUPER", "ALT", k.toUpperCase()],
        action: `Resize ${d === "left" || d === "up" ? "−" : "+"}5px ${d === "left" || d === "right" ? "width" : "height"}`,
        dispatch: `hl.dsp.window.resize({ x = ${d === "left" ? -5 : d === "right" ? 5 : 0}, y = ${d === "up" ? -5 : d === "down" ? 5 : 0}, relative = true })`,
        flags: ["repeating"],
      })),
      { keys: ["SUPER", "O"], action: "Next window opens below", dispatch: 'hl.dsp.layout("preselect d")' },
      { keys: ["SUPER", "U"], action: "Next window opens right", dispatch: 'hl.dsp.layout("preselect r")' },
      { keys: ["SUPER", "LMB"], action: "Drag window", dispatch: "hl.dsp.window.drag()", flags: ["mouse"] },
      { keys: ["SUPER", "RMB"], action: "Resize window", dispatch: "hl.dsp.window.resize()", flags: ["mouse"] },
    ],
  },
  {
    title: "Workspaces",
    binds: [
      { keys: ["SUPER", "1…0"], action: "Go to workspace 1–10", dispatch: "hl.dsp.focus({ workspace = i })" },
      { keys: ["SUPER", "SHIFT", "1…0"], action: "Move window to workspace 1–10", dispatch: "hl.dsp.window.move({ workspace = i })" },
      { keys: ["SUPER", "S"], action: "Toggle scratchpad", dispatch: 'hl.dsp.workspace.toggle_special("magic")' },
      { keys: ["SUPER", "SHIFT", "S"], action: "Move window to scratchpad", dispatch: 'hl.dsp.window.move({ workspace = "special:magic" })' },
      { keys: ["SUPER", "SCROLL ↓"], action: "Next workspace", dispatch: 'hl.dsp.focus({ workspace = "e+1" })', flags: ["mouse"] },
      { keys: ["SUPER", "SCROLL ↑"], action: "Previous workspace", dispatch: 'hl.dsp.focus({ workspace = "e-1" })', flags: ["mouse"] },
      { keys: ["3 FINGERS", "↔"], action: "Swipe workspaces", dispatch: 'hl.gesture({ fingers = 3, direction = "horizontal", action = "workspace" })', flags: ["gesture"] },
    ],
  },
  {
    title: "Media",
    binds: [
      { keys: ["XF86AudioRaiseVolume"], action: "Volume +5%", dispatch: 'exec_cmd("wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%+")', flags: ["locked", "repeating"] },
      { keys: ["XF86AudioLowerVolume"], action: "Volume −5%", dispatch: 'exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-")', flags: ["locked", "repeating"] },
      { keys: ["XF86AudioMute"], action: "Mute output", dispatch: 'exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle")', flags: ["locked", "repeating"] },
      { keys: ["XF86AudioMicMute"], action: "Mute mic", dispatch: 'exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle")', flags: ["locked", "repeating"] },
      { keys: ["XF86AudioPlay"], action: "Play / pause", dispatch: 'exec_cmd("playerctl play-pause")', flags: ["locked"] },
      { keys: ["XF86AudioPause"], action: "Pause", dispatch: 'exec_cmd("playerctl play-pause")', flags: ["locked"] },
      { keys: ["XF86AudioNext"], action: "Next track", dispatch: 'exec_cmd("playerctl next")', flags: ["locked"] },
      { keys: ["XF86AudioPrev"], action: "Previous track", dispatch: 'exec_cmd("playerctl previous")', flags: ["locked"] },
    ],
  },
  {
    title: "Session",
    binds: [{ keys: ["SUPER", "M"], action: "Exit Hyprland", dispatch: "hl.dsp.exit()" }],
  },
];

/**
 * Binds the rest of the rice uses that hyprland.lua doesn't define yet (screenshot,
 * clipboard, lock, …), on keys that are still free there. Shown as suggestions.
 */
export const SUGGESTED_BINDS: HyprBindGroup = {
  title: "Suggested (not in hyprland.lua yet)",
  binds: [
    { keys: ["PRINT"], action: "Screenshot region", dispatch: 'hl.dsp.exec_cmd("hyprshot -m region --raw | satty -f -")' },
    { keys: ["SHIFT", "PRINT"], action: "Screenshot window", dispatch: 'hl.dsp.exec_cmd("hyprshot -m window")' },
    { keys: ["SUPER", "C"], action: "Clipboard history", dispatch: 'hl.dsp.exec_cmd("cliphist list | wofi --dmenu | cliphist decode | wl-copy")' },
    { keys: ["SUPER", "SHIFT", "C"], action: "Pick colour", dispatch: 'hl.dsp.exec_cmd("hyprpicker -a")' },
    { keys: ["SUPER", "ESCAPE"], action: "Lock screen", dispatch: 'hl.dsp.exec_cmd("hyprlock")' },
    { keys: ["SUPER", "N"], action: "Notification centre", dispatch: 'hl.dsp.exec_cmd("swaync-client -t")' },
    { keys: ["SUPER", "SLASH"], action: "Keybind cheatsheet", dispatch: 'hl.dsp.exec_cmd("rice-keybinds")' },
    { keys: ["SUPER", "TAB"], action: "Workspace overview", dispatch: 'hl.dsp.exec_cmd("hyprctl dispatch hyprexpo:expo toggle")' },
    { keys: ["SUPER", "F9"], action: "Keystroke visualizer", dispatch: 'hl.dsp.exec_cmd("pkill wshowkeys || wshowkeys -a bottom")' },
  ],
};

// ───────── colours + export ─────────

const bare = (hex: string) => hex.replace("#", "").toLowerCase();

/** CSS colour for a ColourRef, following the live theme (`--hx-*`). */
export function cssColour(ref: ColourRef): string {
  if (ref.startsWith("#")) return ref;
  const [slot, alpha] = ref.split(":") as [string, string | undefined];
  if (!alpha) return `var(--hx-${slot})`;
  return `color-mix(in srgb, var(--hx-${slot}) ${Math.round((parseInt(alpha, 16) / 255) * 100)}%, transparent)`;
}

/** `rgba(rrggbbaa)` for a ColourRef, resolved against a palette (for config files). */
export function hyprColour(ref: ColourRef, p: Palette): string {
  if (ref.startsWith("#")) return `rgba(${bare(ref)}ff)`;
  const [slot, alpha = "ff"] = ref.split(":") as [Slot, string | undefined];
  return `rgba(${bare(p[slot])}${alpha})`;
}

export const cssGradient = (g: Gradient, angle = `${g.angle}deg`) =>
  g.colours.length === 1 ? cssColour(g.colours[0]!) : `linear-gradient(${angle}, ${g.colours.map(cssColour).join(", ")})`;

const luaGradient = (g: Gradient, p: Palette) =>
  g.colours.length === 1 ? `"${hyprColour(g.colours[0]!, p)}"` : `{ colors = { ${g.colours.map((c) => `"${hyprColour(c, p)}"`).join(", ")} }, angle = ${g.angle} }`;

/** The look as a Hyprland 0.55 Lua block, in the same shape as hyprland.lua. */
export function hyprlandLua(look: HyprLook, p: Palette, anims: Record<string, AnimLeaf> = ANIMATIONS, curves: Record<string, Bezier> = CURVES): string {
  const s = look.shadow, b = look.blur, g = look.group;
  return `-- ~/.config/hypr/look.lua  —  require("look") from hyprland.lua
-- generated by arch-hyprland-mocha-square-rice

hl.config({
    general = {
        gaps_in     = ${look.gapsIn},
        gaps_out    = ${look.gapsOut},
        border_size = ${look.borderSize},
        col = {
            active_border   = ${luaGradient(look.activeBorder, p)},
            inactive_border = "${hyprColour(look.inactiveBorder, p)}",
        },
        layout = "dwindle",
    },

    decoration = {
        rounding         = ${look.rounding},
        active_opacity   = ${look.activeOpacity},
        inactive_opacity = ${look.inactiveOpacity},
        dim_inactive     = ${look.dimInactive},
        dim_strength     = ${look.dimStrength},
        dim_special      = ${look.dimSpecial},

        shadow = {
            enabled        = ${s.enabled},
            range          = ${s.range},
            render_power   = ${s.renderPower},
            color          = "${hyprColour(s.colour, p)}",
            color_inactive = "${hyprColour(s.colourInactive, p)}",
        },

        blur = {
            enabled    = ${b.enabled},
            size       = ${b.size},
            passes     = ${b.passes},
            noise      = ${b.noise},
            contrast   = ${b.contrast},
            brightness = ${b.brightness},
            vibrancy   = ${b.vibrancy},
            popups     = true,
        },
    },

    group = {
        col = {
            border_active   = ${luaGradient(g.activeBorder, p)},
            border_inactive = "${hyprColour(g.inactiveBorder, p)}",
        },
        groupbar = {
            rounding   = ${look.rounding},
            height     = ${g.barHeight},
            col = { active = "${hyprColour(g.barActive, p)}", inactive = "${hyprColour(g.barInactive, p)}" },
            text_color = "${hyprColour(g.barText, p)}",
        },
    },

    misc = { background_color = 0xff${bare(p.crust)} },
})

${Object.entries(curves)
  .filter(([n]) => n !== "default")
  .map(([n, c]) => `hl.curve(${JSON.stringify(n).padEnd(17)} { type = "bezier", points = { {${c[0]}, ${c[1]}}, {${c[2]}, ${c[3]}} } })`.replace('" ', '", '))
  .join("\n")}

${Object.entries(anims)
  .map(([leaf, a]) => `hl.animation({ leaf = ${`"${leaf}",`.padEnd(19)} enabled = ${a.enabled}, speed = ${a.speed}, bezier = "${a.bezier}"${a.style ? `, style = "${a.style}"` : ""} })`)
  .join("\n")}
`;
}
