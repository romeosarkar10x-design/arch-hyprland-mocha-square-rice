import { cx } from "../ui";
import { contrast } from "./color";
import { ACCENTS, NEUTRALS, type Palette, type Swatch } from "./palette";
import { useCssPalette } from "./use-css-palette";

export interface PaletteViewProps {
  /** Palette to show. Omit to show the one in effect where this renders. */
  palette?: Palette;
  /** Show WCAG contrast of each accent against `base`. */
  contrast?: boolean;
  className?: string;
}

/** The 21 theme colours: the neutral ladder and the accents, with hex values and contrast. */
export function PaletteView({ palette, contrast: showContrast = true, className }: PaletteViewProps) {
  const [ref, cssPalette] = useCssPalette();
  const p = palette ?? cssPalette;
  return (
    <div ref={ref} data-component="PaletteView" className={cx("grid gap-2.5 text-[11px]", className)}>
      <div className="grid grid-cols-10 shadow-[0_0_0_1px_var(--hx-surface0)]">
        {NEUTRALS.map((slot) => (
          <div
            key={slot}
            className="flex h-[84px] min-w-0 flex-col justify-end gap-0.5 p-1.5"
            style={{ background: p[slot], color: slot === "text" || slot === "subtext0" ? p.crust : p.text }}
          >
            <b className="truncate text-[10px]">{slot}</b>
            <span className="text-[9.5px] opacity-75">{p[slot]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3.5 gap-y-1.5">
        {ACCENTS.map((slot) => (
          <div key={slot} className="grid grid-cols-[22px_1fr_auto] grid-rows-[auto_auto] items-center gap-x-2">
            <i className="row-span-2 size-[22px]" style={{ background: p[slot] }} />
            <b>{slot}</b>
            <span className="text-overlay1">{p[slot]}</span>
            {showContrast && <span className="col-start-3 row-span-2 row-start-1 text-[10px] text-overlay1">{contrast(p[slot], p.base).toFixed(1)}:1</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface SwatchStripProps {
  swatches: Swatch[];
  /** Hex values to ring as the picked seeds. */
  seeds?: string[];
  className?: string;
}

/** An image's colour clusters, each as wide as its share of the image. */
export function SwatchStrip({ swatches, seeds = [], className }: SwatchStripProps) {
  return (
    <div data-component="SwatchStrip" className={cx("flex h-7 gap-px bg-surface0 p-px", className)}>
      {swatches.map((s) => (
        <i
          key={s.hex}
          title={`${s.hex} · ${(s.weight * 100).toFixed(1)}%`}
          className={cx("relative min-w-1.5", seeds.includes(s.hex) && "shadow-[inset_0_0_0_2px_var(--hx-crust),inset_0_0_0_3px_var(--hx-text)]")}
          style={{ background: s.hex, flexGrow: Math.max(s.weight, 0.012) }}
        />
      ))}
    </div>
  );
}
