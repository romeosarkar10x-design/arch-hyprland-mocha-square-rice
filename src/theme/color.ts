// Colour math for the palette extractor. Everything perceptual happens in OKLab / OKLCH
// (Björn Ottosson, 2020): equal steps in L look equally bright, and hue stays put when
// chroma changes, which is what lets us re-tint Mocha's lightness ladder safely.

export type Rgb = readonly [r: number, g: number, b: number]; // sRGB, 0..1
export type Lab = readonly [l: number, a: number, b: number];
export interface Lch {
  l: number; // 0..1
  c: number; // 0..~0.37
  h: number; // degrees, 0..360
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function rgbToLab([r, g, b]: Rgb): Lab {
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** Unclamped: channels outside 0..1 mean the colour is out of the sRGB gamut. */
export function labToRgb([L, A, B]: Lab): Rgb {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export function labToLch([l, a, b]: Lab): Lch {
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { l, c: Math.hypot(a, b), h: h < 0 ? h + 360 : h };
}

export function lchToLab({ l, c, h }: Lch): Lab {
  const r = (h * Math.PI) / 180;
  return [l, c * Math.cos(r), c * Math.sin(r)];
}

const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** Map an OKLCH colour into sRGB by lowering chroma (keeps lightness and hue exact). */
export function gamutMap(lch: Lch): Rgb {
  let rgb = labToRgb(lchToLab(lch));
  if (inGamut(rgb)) return rgb;
  let lo = 0, hi = lch.c;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(labToRgb(lchToLab({ ...lch, c: mid })))) lo = mid;
    else hi = mid;
  }
  rgb = labToRgb(lchToLab({ ...lch, c: lo }));
  return rgb.map((v) => Math.min(1, Math.max(0, v))) as unknown as Rgb;
}

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((x) => x + x).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgbToHex(rgb: Rgb): string {
  return `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("")}`;
}

export const hexToLch = (hex: string) => labToLch(rgbToLab(hexToRgb(hex)));
export const lchToHex = (lch: Lch) => rgbToHex(gamutMap(lch));

/** WCAG 2 contrast ratio between two hex colours (1..21). */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = hexToRgb(hex).map(toLinear) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

/** Perceptual distance (ΔE in OKLab; ~0.02 is a just-noticeable difference). */
export function deltaE(a: Lab, b: Lab): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** Signed shortest rotation from hue `a` to hue `b`, in degrees (-180..180). */
export function hueDelta(a: number, b: number): number {
  return ((b - a + 540) % 360) - 180;
}

export const wrapHue = (h: number) => ((h % 360) + 360) % 360;

/** Mix two hex colours in OKLab (t = share of `b`). */
export function mix(a: string, b: string, t: number): string {
  const x = rgbToLab(hexToRgb(a)), y = rgbToLab(hexToRgb(b));
  return rgbToHex(gamutMap(labToLch([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t])));
}

/** `#rrggbb` + alpha (0..1) as `rgba(...)`. */
export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex).map((v) => Math.round(v * 255));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
