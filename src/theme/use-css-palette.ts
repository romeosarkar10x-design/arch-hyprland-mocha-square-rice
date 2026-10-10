import { useCallback, useLayoutEffect, useState } from "react";
import { MOCHA, type Palette, type Slot } from "./palette";

/**
 * The palette in effect at an element: reads the cascaded `--hx-*` values, so it reflects
 * whatever <ThemeProvider> (local or global) wraps the element. Attach the returned ref.
 */
export function useCssPalette(): [ref: (el: HTMLElement | null) => void, palette: Palette] {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [palette, setPalette] = useState<Palette>(MOCHA);
  const ref = useCallback((node: HTMLElement | null) => setEl(node), []);

  useLayoutEffect(() => {
    if (!el) return;
    const read = () => {
      const style = getComputedStyle(el);
      const next = { ...MOCHA };
      for (const slot of Object.keys(MOCHA) as Slot[]) {
        const v = style.getPropertyValue(`--hx-${slot}`).trim();
        if (/^#[0-9a-f]{6}$/i.test(v)) next[slot] = v.toLowerCase();
      }
      setPalette((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    read();
    // Themes change by rewriting a `style` attribute: <html> (global) or a wrapper (local).
    const mo = new MutationObserver(read);
    let parent: HTMLElement | null = el.parentElement;
    while (parent) {
      mo.observe(parent, { attributes: true, attributeFilter: ["style"] });
      parent = parent.parentElement;
    }
    return () => mo.disconnect();
  }, [el]);

  return [ref, palette];
}
