---
category: Data
---

Canvas history graph with gradient fill, dotted grid and hover crosshair readout. `mirror` puts a series below the midline (down/up traffic).

```tsx
<Graph series={[{ label: "cpu", data: history, accent: "sky" }]} max={100} />
<Graph kind="bars" series={[{ label: "power", data: watts, accent: "peach" }]} max={450} format={(v) => v + " W"} />
```

Data is oldest-first; the newest sample sits on the right edge. Default capacity 60 samples (one per second).
