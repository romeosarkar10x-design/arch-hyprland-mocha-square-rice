---
category: Data
---

Proportional stacked bar with legend; the remainder is hatched free space.

```tsx
<StackBar total={32} format={(v) => v + " GiB"} segments={[{ label: "used", value: 9.4, accent: "mauve" }, { label: "cached", value: 4.6, accent: "blue" }]} />
```
