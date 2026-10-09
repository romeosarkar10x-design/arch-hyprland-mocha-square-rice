BarSegment from hyprland-ui. Use via `window.HyprlandUI.BarSegment` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

One bar module. Colour lives in the text; hover lifts to surface0; `open` adds a 2px top strip in the text colour.

```tsx
<BarSegment icon="cpu" accent="sky" divider spark={history}>12% 46° 61<Unit>W</Unit></BarSegment>
<BarSegment icon="memory" accent="mauve" divider level="warn">78%</BarSegment>
```

Module accents: network sapphire, cpu sky, gpu green, memory mauve, audio yellow, media green, window title lavender. `level="crit"` floods red. variant: plain | launcher | power | title | clock | media.

## Props

```ts
interface BarSegmentProps {
  icon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Main readout, e.g. "12%". */
  children?: React.ReactNode;
  /** Text colour of the whole segment. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** warn turns the text yellow; crit floods the segment red. */
  level?: "ok" | "warn" | "crit";
  /** Recent samples, drawn as a tiny bar sparkline after the readout. */
  spark?: number[];
  /** Draw the 1px divider on the left (right-hand modules use this). */
  divider?: boolean;
  /** Popup for this segment is open: surface fill and a 2px accent strip on top. */
  open?: boolean;
  /** Solid block variants for the launcher (mauve) and power (red) ends. */
  variant?: "clock" | "power" | "plain" | "launcher" | "title" | "media";
  /** Visually dim (e.g. muted audio, paused media). */
  dim?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  label?: string;
  className?: string;
}
```
