import { useEffect, useLayoutEffect, useRef, useState, type DependencyList } from "react";
import { extendTailwindMerge } from "tailwind-merge";

/** A Mocha colour name. Every coloured component takes one as `accent`. */
export type Accent = "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";

export type Level = "ok" | "warn" | "crit";

// Teach tailwind-merge the kit's theme names that don't look like stock Tailwind ones.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display"],
      shadow: ["popup", "window"],
      animate: ["blink", "slide", "drop", "pop", "fade", "timer", "caret", "grow", "turn", "flash"],
      ease: ["hx", "overshot"],
    },
  },
});

/** Join class names; later Tailwind utilities win over earlier conflicting ones (so `className` overrides). */
export function cx(...parts: (string | false | null | undefined)[]) {
  return twMerge(parts.filter(Boolean).join(" "));
}

/**
 * `data-component` names every rendered component so it can be found from the DOM inspector.
 * A component whose root is another kit component passes its own name down; the root then
 * lists both, outermost first ("CpuPanel Panel"), so `[data-component~="Panel"]` still matches.
 */
export interface ComponentTag {
  "data-component"?: string;
}

export const componentName = (own: string, outer: string | undefined) => (outer ? `${outer} ${own}` : own);

export const accentVar = (a: string | undefined, fallback = "mauve") => `var(--hx-${a ?? fallback})`;

export function level(value: number, warn = 60, crit = 90): Level {
  return value >= crit ? "crit" : value >= warn ? "warn" : "ok";
}

export const levelVar = (l: Level, ok: string) => (l === "crit" ? "var(--hx-red)" : l === "warn" ? "var(--hx-yellow)" : ok);

export function bytes(n: number, digits = 1) {
  const u = ["B", "KiB", "MiB", "GiB", "TiB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : digits)} ${u[i]}`;
}

export function rate(bytesPerSec: number) {
  return bytes(bytesPerSec) + "/s";
}

export const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

/** A DPR-aware canvas that redraws on resize and whenever `deps` change. */
export function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: DependencyList) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !size.w || !size.h) return;
    const dpr = window.devicePixelRatio || 1;
    el.width = Math.round(size.w * dpr);
    el.height = Math.round(size.h * dpr);
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    drawRef.current(ctx, size.w, size.h);
  }, [size, ...deps]);
  return ref;
}

/** Canvas can't read CSS variables; resolve `var(--x)` against an element. */
export function resolveColor(el: Element | null, expr: string) {
  if (!el || !expr.startsWith("var(")) return expr;
  const name = expr.slice(4, -1).split(",")[0]!.trim();
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || expr;
}

/** setInterval that always calls the latest `fn`; `ms = null` pauses it. */
export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (ms == null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

/** Ease-out-cubic tween toward `target`. */
export function useTween(target: number, ms = 400) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (typeof requestAnimationFrame === "undefined") {
      setV(target);
      return;
    }
    const a = from.current;
    const t0 = performance.now();
    let id = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const next = a + (target - a) * e;
      from.current = next;
      setV(next);
      if (k < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, ms]);
  return v;
}
