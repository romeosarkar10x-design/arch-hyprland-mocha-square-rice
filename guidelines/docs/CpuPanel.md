---
category: Popups
---

CPU popup: load/temp/power gauges, 60 s history, per-thread heatmap, clock meter. Live-simulated unless `data` is passed.

```tsx
<CpuPanel />
<CpuPanel data={stats.cpu} />
```

Opened from the cpu BarSegment.
