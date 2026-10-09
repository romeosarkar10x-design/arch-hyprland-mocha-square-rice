Unit from hyprland-ui. Use via `window.HyprlandUI.Unit` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Dim unit suffix inside a bar readout.

```tsx
<BarSegment icon="gpu" accent="green">42% 61° 212<Unit>W</Unit></BarSegment>
```

## Props

```ts
interface UnitProps {
  children: React.ReactNode;
}
```
