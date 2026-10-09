CoreGrid from hyprland-ui. Use via `window.HyprlandUI.CoreGrid` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Per-thread heatmap; squares tint toward the accent by load and flip to yellow/red at 60/90 %.

```tsx
<CoreGrid cores={[12, 40, 8, 95, 33, 61, 20, 18, 5, 72, 44, 10]} columns={6} />
```

## Props

```ts
interface CoreGridProps {
  /** Per-thread usage, 0–100. */
  cores: number[];
  /** Cells per row. */
  columns?: number;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  className?: string;
}
```
