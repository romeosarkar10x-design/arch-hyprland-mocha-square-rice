Meter from hyprland-ui. Use via `window.HyprlandUI.Meter` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Segmented LED-style meter with a caption row.

```tsx
<Meter label="vram" value={30} readout="7.2 / 24 GiB" accent="green" />
```

`levels={false}` keeps the accent colour at every value (fan speed, clock).

## Props

```ts
interface MeterProps {
  /** 0–100 fill. */
  value: number;
  /** Left caption, e.g. "VRAM". */
  label?: React.ReactNode;
  /** Right readout; defaults to the rounded percent. */
  readout?: React.ReactNode;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Number of cells. */
  cells?: number;
  /** Optional peak marker (0–100), drawn as a bright cell. */
  peak?: number;
  /** Colour by level (yellow at 60, red at 90). Turn off for things like fan speed. */
  levels?: boolean;
  /** Cell height in px. */
  height?: number;
  className?: string;
}
```
