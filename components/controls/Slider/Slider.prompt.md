Slider from hyprland-ui. Use via `window.HyprlandUI.Slider` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Volume / brightness slider: drag, click, wheel and arrow keys. Optional icon button on the left (e.g. mute).

```tsx
<Slider label="Volume" icon="volumeMedium" defaultValue={64} accent="yellow" />
```

`muted` greys the fill. `format` changes the readout.

## Props

```ts
interface SliderProps {
  /** Controlled value 0–max. Omit to use `defaultValue`. */
  value?: number;
  defaultValue?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Icon at the left end (click target for e.g. mute). */
  icon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  onIconClick?: () => void;
  /** Show the value at the right end, e.g. "64%". */
  showValue?: boolean;
  /** Formats the value readout. */
  format?: (value: number) => string;
  /** Number of tick marks under the track (0 for none). */
  ticks?: number;
  /** Greys the fill, e.g. while muted. */
  muted?: boolean;
  label?: string;
  className?: string;
}
```
