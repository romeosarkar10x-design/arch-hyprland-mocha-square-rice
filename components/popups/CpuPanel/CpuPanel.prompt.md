CpuPanel from hyprland-ui. Use via `window.HyprlandUI.CpuPanel` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

CPU popup: load/temp/power gauges, 60 s history, per-thread heatmap, clock meter. Live-simulated unless `data` is passed.

```tsx
<CpuPanel />
<CpuPanel data={stats.cpu} />
```

Opened from the cpu BarSegment.

## Props

```ts
interface CpuPanelProps {
  /** Live stats. Omit to run on the built-in simulation. */
  data?: CpuStats;
  /** Freeze the simulation (ignored when `data` is passed). */
  paused?: boolean;
  onOpenMonitor?: () => void;
  className?: string;
}
```
