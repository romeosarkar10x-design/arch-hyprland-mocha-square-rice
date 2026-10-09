---
category: Bar
---

One bar module. Colour lives in the text; hover lifts to surface0; `open` adds a 2px top strip in the text colour.

```tsx
<BarSegment icon="cpu" accent="sky" divider spark={history}>12% 46° 61<Unit>W</Unit></BarSegment>
<BarSegment icon="memory" accent="mauve" divider level="warn">78%</BarSegment>
```

Module accents: network sapphire, cpu sky, gpu green, memory mauve, audio yellow, media green, window title lavender. `level="crit"` floods red. variant: plain | launcher | power | title | clock | media.
