import { contrast } from "./color";
import { ACCENTS, NEUTRALS, type Palette, type Swatch } from "./palette";
import { useCssPalette } from "./use-css-palette";
import "./theme.css";

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
    <div ref={ref} className={["rx-pal", className].filter(Boolean).join(" ")}>
      <div className="rx-pal-ladder">
        {NEUTRALS.map((slot) => (
          <div key={slot} style={{ background: p[slot], color: slot === "text" || slot === "subtext0" ? p.crust : p.text }}>
            <b>{slot}</b>
            <span>{p[slot]}</span>
          </div>
        ))}
      </div>
      <div className="rx-pal-accents">
        {ACCENTS.map((slot) => (
          <div key={slot}>
            <i style={{ background: p[slot] }} />
            <b>{slot}</b>
            <span className="hx-faint">{p[slot]}</span>
            {showContrast && <span className="rx-pal-ratio">{contrast(p[slot], p.base).toFixed(1)}:1</span>}
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
    <div className={["rx-strip", className].filter(Boolean).join(" ")}>
      {swatches.map((s) => (
        <i
          key={s.hex}
          title={`${s.hex} · ${(s.weight * 100).toFixed(1)}%`}
          className={seeds.includes(s.hex) ? "is-seed" : undefined}
          style={{ background: s.hex, flexGrow: Math.max(s.weight, 0.012) }}
        />
      ))}
    </div>
  );
}
