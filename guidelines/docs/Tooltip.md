---
category: Bar
---

Hover card for a bar segment: 3px accent strip on top, key/value rows (optional inline bars), hint footer.

```tsx
<Tooltip title="Memory" subtitle="DDR5 · 32 GiB" icon="memory" accent="mauve"
  rows={[{ label: "ram", value: "9.4 GiB", bar: 31 }, { label: "swap", value: "0.3 GiB", bar: 4 }]}
  hints={[["click", "btop"]]} />
```
