Gauge from hyprland-ui. Use via `window.HyprlandUI.Gauge` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

270° segmented arc gauge with animated number. Turns yellow past `warn` and red past `crit` (percent of max).

```tsx
<Gauge value={42} label="load" accent="sky" />
<Gauge value={71} max={100} unit="°" label="temp" warn={75} crit={85} />
<Gauge value={212} max={450} unit="W" label="power" accent="peach" sub="of 450 W" />
```

Thresholds: usage 60/90 %, temperatures 75/85 °C.

## Props

```ts
interface GaugeProps {
  /** Current value in the gauge's own unit. */
  value: number;
  /** Full-scale value. Defaults to 100. */
  max?: number;
  /** Caption under the number, e.g. "LOAD", "TEMP". */
  label: string;
  /** Unit after the number, e.g. "%", "°", "W". */
  unit?: string;
  /** Small line under the caption, e.g. "of 220 W". */
  sub?: React.ReactNode;
  /** Colour while below the warn threshold. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Thresholds as percentages of max. Defaults to 60 / 90. */
  warn?: number;
  crit?: number;
  /** Outer size in px. */
  size?: number;
  /** Number of segments around the 270° arc. */
  segments?: number;
  className?: string;
}
```
