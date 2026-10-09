StackBar from hyprland-ui. Use via `window.HyprlandUI.StackBar` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Proportional stacked bar with legend; the remainder is hatched free space.

```tsx
<StackBar total={32} format={(v) => v + " GiB"} segments={[{ label: "used", value: 9.4, accent: "mauve" }, { label: "cached", value: 4.6, accent: "blue" }]} />
```

## Props

```ts
interface StackBarProps {
  /** Parts of the whole, in any unit; the bar fills by their share of `total`. */
  segments: StackSegment[];
  /** Whole; the remainder is drawn as free space. */
  total: number;
  /** Formats each legend value. */
  format?: (value: number) => string;
  /** Hide the legend under the bar. */
  hideLegend?: boolean;
  className?: string;
}
```
