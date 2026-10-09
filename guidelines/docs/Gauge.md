---
category: Data
---

270° segmented arc gauge with animated number. Turns yellow past `warn` and red past `crit` (percent of max).

```tsx
<Gauge value={42} label="load" accent="sky" />
<Gauge value={71} max={100} unit="°" label="temp" warn={75} crit={85} />
<Gauge value={212} max={450} unit="W" label="power" accent="peach" sub="of 450 W" />
```

Thresholds: usage 60/90 %, temperatures 75/85 °C.
