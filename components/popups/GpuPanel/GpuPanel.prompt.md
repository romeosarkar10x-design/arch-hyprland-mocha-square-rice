GpuPanel from hyprland-ui. Use via `window.HyprlandUI.GpuPanel` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

NVIDIA popup: load/temp/power gauges, power-draw bars, VRAM/clock/fan meters.

```tsx
<GpuPanel />
```

## Props

```ts
interface GpuPanelProps {
  data?: GpuStats;
  paused?: boolean;
  onOpenMonitor?: () => void;
  className?: string;
}
```
