// Wallpaper -> hyprland-ui palette.
//
// The design system is styled entirely through `--hx-*` custom properties, so a theme is
// just 21 colours: 10 neutrals (crust … text) and 11 accents (mauve … lavender). This
// module derives those 21 colours from an image without letting the image dictate the
// parts that make a palette readable:
//
//   1. Sample the image and cluster it in OKLab with k-means++ (perceptual clusters,
//      deterministic seed so the same wallpaper always gives the same theme).
//   2. Score the clusters by population, chroma and usable lightness, then pick a
//      primary, a secondary and a tertiary colour that are at least 30° of hue apart.
//   3. Neutrals keep Catppuccin Mocha's lightness ladder exactly (so every contrast ratio
//      the components were designed against still holds) and only take the wallpaper's
//      colour cast as a small, capped chroma tint.
//   4. Accents keep Mocha's pastel lightness/chroma shape. Mauve/lavender become the
//      primary, pink the secondary. Every other slot snaps toward a wallpaper colour that
//      sits near its canonical hue, or is gently harmonised toward the primary. Semantic
//      slots (red, yellow, green: crit / warn / ok) get narrow windows so an error never
//      turns orange-brown and "ok" never turns teal.
//   5. A final pass lifts any accent whose WCAG contrast against base falls below 4.5.

import {
  contrast,
  deltaE,
  hexToLch,
  hexToRgb,
  hueDelta,
  labToLch,
  lchToHex,
  rgbToLab,
  rgba,
  wrapHue,
  type Lab,
  type Lch,
} from "./color.ts";

export const NEUTRALS = [
  "crust", "mantle", "base", "surface0", "surface1", "surface2", "overlay0", "overlay1", "subtext0", "text",
] as const;
export const ACCENTS = [
  "mauve", "pink", "yellow", "peach", "red", "green", "sky", "sapphire", "teal", "blue", "lavender",
] as const;

export type NeutralSlot = (typeof NEUTRALS)[number];
export type AccentSlot = (typeof ACCENTS)[number];
export type Slot = NeutralSlot | AccentSlot;
export type Palette = Record<Slot, string>;

/** The design system's stock palette (Catppuccin Mocha). */
export const MOCHA: Palette = {
  crust: "#11111b", mantle: "#181825", base: "#1e1e2e",
  surface0: "#313244", surface1: "#45475a", surface2: "#585b70",
  overlay0: "#6c7086", overlay1: "#7f849c", subtext0: "#a6adc8", text: "#cdd6f4",
  mauve: "#cba6f7", pink: "#f5c2e7", yellow: "#f9e2af", peach: "#fab387", red: "#f38ba8",
  green: "#a6e3a1", sky: "#89dceb", sapphire: "#74c7ec", teal: "#94e2d5", blue: "#89b4fa",
  lavender: "#b4befe",
};

const MOCHA_LCH = Object.fromEntries(Object.entries(MOCHA).map(([k, v]) => [k, hexToLch(v)])) as Record<Slot, Lch>;

export type Vibrancy = "muted" | "balanced" | "vivid";
const VIBRANCY: Record<Vibrancy, number> = { muted: 0.72, balanced: 1, vivid: 1.28 };

export interface ExtractOptions {
  /** How saturated the accents are. Neutrals barely move either way. */
  vibrancy?: Vibrancy;
  /** Clusters to look for (default 10). */
  clusters?: number;
}

export interface Swatch {
  hex: string;
  lch: Lch;
  /** Share of the sampled image, 0..1. */
  weight: number;
}

export interface Theme {
  palette: Palette;
  /** Every colour cluster found, most populous first. */
  swatches: Swatch[];
  /** The picked seed colours, as they appear in the image. */
  seeds: { primary: Swatch; secondary: Swatch; tertiary: Swatch };
  /** True when the image had no usable colour and the theme fell back to a muted Mocha hue. */
  monochrome: boolean;
}

// ───────── clustering ─────────

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dist2 = (a: Lab, b: Lab) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

function kmeans(points: Lab[], k: number): { center: Lab; count: number }[] {
  const rand = mulberry32(0x4859_5052);
  const centers: Lab[] = [points[Math.floor(rand() * points.length)]!];
  const nearest = new Float64Array(points.length).fill(Infinity);
  // k-means++: each new centre is drawn with probability proportional to its squared
  // distance from the existing ones, which spreads seeds across distinct colours.
  while (centers.length < k) {
    const last = centers[centers.length - 1]!;
    let total = 0;
    for (let i = 0; i < points.length; i++) {
      nearest[i] = Math.min(nearest[i]!, dist2(points[i]!, last));
      total += nearest[i]!;
    }
    if (total === 0) break;
    let r = rand() * total;
    let pick = 0;
    for (; pick < points.length - 1; pick++) if ((r -= nearest[pick]!) <= 0) break;
    centers.push(points[pick]!);
  }

  const assign = new Int32Array(points.length).fill(-1);
  for (let iter = 0; iter < 24; iter++) {
    let moved = 0;
    for (let i = 0; i < points.length; i++) {
      let best = 0, bestD = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const d = dist2(points[i]!, centers[c]!);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      if (assign[i] !== best) {
        assign[i] = best;
        moved++;
      }
    }
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < points.length; i++) {
      const s = sums[assign[i]!]!, p = points[i]!;
      s[0]! += p[0]; s[1]! += p[1]; s[2]! += p[2]; s[3]!++;
    }
    sums.forEach((s, c) => {
      if (s[3]) centers[c] = [s[0]! / s[3], s[1]! / s[3], s[2]! / s[3]];
    });
    if (moved < points.length * 0.002) break;
  }
  const counts = centers.map(() => 0);
  for (const a of assign) counts[a]!++;
  return centers.map((center, i) => ({ center, count: counts[i]! }));
}

/** RGBA bytes (canvas ImageData layout) -> colour clusters, most populous first. */
export function clusterPixels(data: ArrayLike<number>, clusters = 10): Swatch[] {
  const pixels = data.length / 4;
  const stride = Math.max(1, Math.floor(pixels / 12000));
  const points: Lab[] = [];
  for (let p = 0; p < pixels; p += stride) {
    const i = p * 4;
    if ((data[i + 3] ?? 255) < 128) continue;
    points.push(rgbToLab([data[i]! / 255, data[i + 1]! / 255, data[i + 2]! / 255]));
  }
  if (points.length === 0) return [];

  // Merge clusters that are perceptually the same colour, then drop specks.
  const merged: { center: Lab; count: number }[] = [];
  for (const c of kmeans(points, Math.min(clusters, points.length)).filter((k) => k.count > 0)) {
    const twin = merged.find((m) => deltaE(m.center, c.center) < 0.035);
    if (!twin) {
      merged.push({ ...c });
      continue;
    }
    const n = twin.count + c.count;
    twin.center = twin.center.map((v, j) => (v * twin.count + c.center[j]! * c.count) / n) as unknown as Lab;
    twin.count = n;
  }
  return merged
    .map(({ center, count }) => {
      const lch = labToLch(center);
      return { hex: lchToHex(lch), lch, weight: count / points.length };
    })
    .filter((s) => s.weight >= 0.004)
    .sort((a, b) => b.weight - a.weight);
}

// ───────── palette ─────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** How good a cluster is as a theme seed: common, colourful, and not near-black/white. */
function seedScore(s: Swatch): number {
  const chroma = smoothstep(0.025, 0.13, s.lch.c) + 0.3 * smoothstep(0.13, 0.22, s.lch.c);
  const light = clamp(1 - Math.abs(s.lch.l - 0.62) * 1.5, 0.2, 1);
  return s.weight ** 0.55 * chroma * light;
}

const synth = (lch: Lch): Swatch => ({ hex: lchToHex(lch), lch, weight: 0 });

function pickSeeds(swatches: Swatch[]) {
  const chromatic = swatches.filter((s) => s.lch.c >= 0.03).sort((a, b) => seedScore(b) - seedScore(a));
  const primary = chromatic[0];
  if (!primary) {
    const fallback = synth({ ...MOCHA_LCH.mauve, c: 0.05 });
    return {
      monochrome: true,
      primary: fallback,
      secondary: synth({ ...MOCHA_LCH.pink, c: 0.045 }),
      tertiary: synth({ ...MOCHA_LCH.blue, c: 0.045 }),
    };
  }
  const apart = (s: Swatch, ...others: Swatch[]) => others.every((o) => Math.abs(hueDelta(o.lch.h, s.lch.h)) >= 30);
  // No distinct second colour: fall back to analogous hues either side of the primary.
  const secondary =
    chromatic.find((s) => apart(s, primary)) ?? synth({ ...primary.lch, h: wrapHue(primary.lch.h + 38), c: primary.lch.c * 0.8 });
  const tertiary =
    chromatic.find((s) => apart(s, primary, secondary)) ??
    synth({ ...primary.lch, h: wrapHue(primary.lch.h - 38), c: primary.lch.c * 0.7 });
  return { monochrome: false, primary, secondary, tertiary };
}

/** Weighted circular mean of the image's hues: its overall colour cast. */
function colourCast(swatches: Swatch[]): { h: number; c: number } {
  let x = 0, y = 0, w = 0, c = 0;
  for (const s of swatches) {
    const k = s.weight * s.lch.c;
    x += Math.cos((s.lch.h * Math.PI) / 180) * k;
    y += Math.sin((s.lch.h * Math.PI) / 180) * k;
    w += k;
    c += s.weight * s.lch.c;
  }
  return { h: w ? wrapHue((Math.atan2(y, x) * 180) / Math.PI) : MOCHA_LCH.base.h, c };
}

// How far each accent slot may be pulled toward a wallpaper colour near its own hue.
// Semantic slots get narrow windows so they keep their meaning.
const SNAP_WINDOW: Partial<Record<AccentSlot, number>> = {
  red: 16, yellow: 18, green: 24, peach: 30, teal: 30, sky: 26, sapphire: 26, blue: 32,
};
const SEMANTIC = new Set<AccentSlot>(["red", "yellow", "green"]);

export function paletteFromSwatches(swatches: Swatch[], options: ExtractOptions = {}): Theme {
  const vib = VIBRANCY[options.vibrancy ?? "balanced"];
  const { monochrome, primary, secondary, tertiary } = pickSeeds(swatches);
  const palette = {} as Palette;

  // Neutrals: Mocha's exact lightness ladder, re-tinted with the image's cast.
  const cast = colourCast(swatches);
  const castStrength = monochrome ? 0.35 : clamp(cast.c / 0.05, 0.4, 1.15);
  const neutralHue = monochrome ? MOCHA_LCH.base.h : cast.c > 0.02 ? cast.h : primary.lch.h;
  for (const slot of NEUTRALS) {
    const m = MOCHA_LCH[slot];
    // Text must stay near-white, and warm/green casts turn muddy (brown, olive) at a
    // chroma that reads as a pleasant tint for blue/violet, so those get a tighter cap.
    const muddy = neutralHue > 20 && neutralHue < 175 ? 0.65 : 1;
    const cap = (slot === "text" ? 0.022 : slot === "subtext0" ? 0.03 : 0.036) * muddy;
    palette[slot] = lchToHex({ l: m.l, c: Math.min(cap, m.c * castStrength * Math.sqrt(vib)), h: neutralHue });
  }

  // Accents. Mocha's pastel lightness and chroma, wallpaper hues.
  const accent = (slot: AccentSlot, h: number, c: number, l = MOCHA_LCH[slot].l) =>
    lchToHex({ l, c: clamp(c * vib, 0.03, 0.19), h: wrapHue(h) });
  const p = primary.lch;
  const pc = monochrome ? p.c : clamp(p.c * 1.15, 0.085, 0.16);
  palette.mauve = accent("mauve", p.h, pc, clamp(p.l, 0.76, 0.84));
  palette.lavender = accent("lavender", p.h + hueDelta(p.h, MOCHA_LCH.lavender.h) * 0.2, pc * 0.62, 0.84);
  palette.pink = accent("pink", secondary.lch.h, monochrome ? secondary.lch.c : clamp(secondary.lch.c, 0.06, 0.12), 0.86);

  const pool = [tertiary, ...swatches].filter((s) => s.lch.c >= 0.04 && (s.weight >= 0.01 || s === tertiary));
  for (const slot of Object.keys(SNAP_WINDOW) as AccentSlot[]) {
    const m = MOCHA_LCH[slot];
    const window = SNAP_WINDOW[slot]!;
    const near = monochrome
      ? undefined
      : pool
          .map((s) => ({ s, d: hueDelta(m.h, s.lch.h) }))
          .filter(({ d }) => Math.abs(d) <= window)
          .sort((a, b) => Math.abs(a.d) - Math.abs(b.d))[0];
    if (near) {
      // Snap most of the way, and borrow some of the wallpaper's own saturation.
      const c = clamp((m.c + near.s.lch.c) / 2, m.c * 0.7, m.c * 1.2);
      palette[slot] = accent(slot, m.h + near.d * (SEMANTIC.has(slot) ? 0.6 : 0.85), c);
    } else {
      const pull = SEMANTIC.has(slot) ? 6 : 12;
      const c = monochrome ? m.c * 0.55 : m.c;
      palette[slot] = accent(slot, m.h + clamp(hueDelta(m.h, p.h) * 0.15, -pull, pull), c);
    }
  }

  // Distinctness guard: a semantic colour must not be mistaken for the primary or
  // secondary (a pink wallpaper must not make errors look like the accent). Rotate it
  // away, within its window, until the two are clearly different.
  const lab = (hex: string) => rgbToLab(hexToRgb(hex));
  const rivals = [lab(palette.mauve), lab(palette.pink)];
  for (const slot of SEMANTIC) {
    const m = MOCHA_LCH[slot];
    const base = hexToLch(palette[slot]);
    const candidate = (k: number) =>
      lchToHex({ l: base.l - Math.abs(k) / 600, c: Math.min(0.19, base.c * (1 + Math.abs(k) / 60)), h: wrapHue(base.h + k) });
    const separation = (hex: string) => Math.min(...rivals.map((r) => deltaE(lab(hex), r)));
    if (separation(palette[slot]) >= 0.08) continue;
    // Smallest rotation that separates it; otherwise the best one available.
    let best = palette[slot], bestSep = separation(best);
    for (let step = 3; step <= 30; step += 3) {
      // Red only ever warms (toward vermilion): rotated the other way it turns magenta.
      for (const k of slot === "red" ? [step] : [step, -step]) {
        if (Math.abs(hueDelta(m.h, base.h + k)) > 30) continue;
        const hex = candidate(k), sep = separation(hex);
        if (sep > bestSep) {
          best = hex;
          bestSep = sep;
        }
      }
      if (bestSep >= 0.08) break;
    }
    palette[slot] = best;
  }

  // Readability guard: lift any accent until it reads on base (WCAG AA, 4.5:1).
  for (const slot of ACCENTS) {
    let lch = hexToLch(palette[slot]);
    while (contrast(palette[slot], palette.base) < 4.5 && lch.l < 0.95) {
      lch = { ...lch, l: lch.l + 0.01 };
      palette[slot] = lchToHex(lch);
    }
  }

  return { palette, swatches, seeds: { primary, secondary, tertiary }, monochrome };
}

export const paletteFromPixels = (data: ArrayLike<number>, options: ExtractOptions = {}) =>
  paletteFromSwatches(clusterPixels(data, options.clusters), options);

// ───────── browser ─────────

const cache = new Map<string, Promise<Theme>>();

async function loadImage(src: string): Promise<HTMLImageElement> {
  // A data: SVG drawn to canvas can taint it in some engines; a same-origin blob URL never does.
  let url = src;
  if (src.startsWith("data:image/svg+xml")) {
    const svg = decodeURIComponent(src.slice(src.indexOf(",") + 1));
    url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  img.src = url;
  try {
    await img.decode();
  } finally {
    if (url !== src) URL.revokeObjectURL(url);
  }
  return img;
}

/** Load an image URL (http, data: or blob:) and derive a theme from it. Cached per src. */
export function extractTheme(src: string, options: ExtractOptions = {}): Promise<Theme> {
  const key = `${options.vibrancy ?? "balanced"}|${options.clusters ?? 10}|${src}`;
  let theme = cache.get(key);
  if (!theme) {
    theme = loadImage(src).then((img) => {
      const scale = Math.min(1, 160 / Math.max(img.naturalWidth || 160, img.naturalHeight || 90));
      const w = Math.max(1, Math.round((img.naturalWidth || 160) * scale));
      const h = Math.max(1, Math.round((img.naturalHeight || 90) * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("2D canvas unavailable");
      ctx.drawImage(img, 0, 0, w, h);
      try {
        return paletteFromPixels(ctx.getImageData(0, 0, w, h).data, options);
      } catch (e) {
        throw new Error(`Can't read pixels of ${src.slice(0, 60)}: the server must send CORS headers`, { cause: e });
      }
    });
    theme.catch(() => cache.delete(key));
    cache.set(key, theme);
  }
  return theme;
}

/** The custom properties that retheme every hyprland-ui component. */
export function paletteVars(palette: Palette): Record<`--hx-${string}`, string> {
  const vars: Record<`--hx-${string}`, string> = {};
  for (const [slot, hex] of Object.entries(palette)) vars[`--hx-${slot}`] = hex;
  vars["--hx-bar-ground"] = rgba(palette.crust, 0.92);
  vars["--hx-border-inactive"] = rgba(palette.surface0, 0.8);
  return vars;
}

/** `:root { --hx-…: … }` stylesheet text for a palette. */
export function paletteCss(palette: Palette, selector = ":root"): string {
  const body = Object.entries(paletteVars(palette))
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `${selector} {\n${body}\n}\n`;
}
