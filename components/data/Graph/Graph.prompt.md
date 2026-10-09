Graph from hyprland-ui. Use via `window.HyprlandUI.Graph` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Canvas history graph with gradient fill, dotted grid and hover crosshair readout. `mirror` puts a series below the midline (down/up traffic).

```tsx
<Graph series={[{ label: "cpu", data: history, accent: "sky" }]} max={100} />
<Graph kind="bars" series={[{ label: "power", data: watts, accent: "peach" }]} max={450} format={(v) => v + " W"} />
```

Data is oldest-first; the newest sample sits on the right edge. Default capacity 60 samples (one per second).

## Props

```ts
interface GraphProps {
  series: GraphSeries[];
  /** Fixed full scale. Omit to auto-scale to the largest sample. */
  max?: number;
  /** Total sample slots across the width (history length). */
  capacity?: number;
  height?: number;
  /** Formats values in the hover readout and the scale label. */
  format?: (value: number) => string;
  /** Horizontal grid lines. */
  gridLines?: number;
  /** "area" fills under the line; "bars" draws one column per sample. */
  kind?: "area" | "bars";
  className?: string;
}
```
