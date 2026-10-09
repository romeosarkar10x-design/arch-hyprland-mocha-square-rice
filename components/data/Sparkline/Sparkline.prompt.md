Sparkline from hyprland-ui. Use via `window.HyprlandUI.Sparkline` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Tiny bar sparkline in the current text colour. Lives inside BarSegments.

```tsx
<Sparkline data={[12, 18, 30, 22, 41, 37, 25, 19]} />
```

BarSegment's `spark` prop renders this for you.

## Props

```ts
interface SparklineProps {
  /** Oldest first. */
  data: number[];
  max?: number;
  /** Number of bars shown (most recent). */
  bars?: number;
  /** Bar height in px. */
  height?: number;
  className?: string;
}
```
