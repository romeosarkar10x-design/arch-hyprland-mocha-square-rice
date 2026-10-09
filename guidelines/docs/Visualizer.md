---
category: Data
---

cava-style audio spectrum on canvas with falling peak caps and a bass→treble gradient. Runs a built-in simulation when `bars` is omitted.

```tsx
<Visualizer height={90} from="mauve" to="sky" />
<Visualizer variant="mirror" from="green" to="teal" />
```

Pass `bars` (0–100 per bar) to drive it from real data.
