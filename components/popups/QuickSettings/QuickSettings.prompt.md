QuickSettings from hyprland-ui. Use via `window.HyprlandUI.QuickSettings` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Toggle tiles for desktop modes (caffeine, DND, night light, bluetooth, record, game mode) plus brightness/volume. On tiles flood with their accent.

```tsx
<QuickSettings />
<QuickSettings bare columns={3} />
```

## Props

```ts
interface QuickSettingsProps {
  tiles?: QuickTile[];
  /** Columns in the tile grid. */
  columns?: number;
  onToggle?: (id: string, on: boolean) => void;
  /** Render just the grid (no Panel chrome or sliders). */
  bare?: boolean;
  className?: string;
}
```
