---
category: Overlays
---

App launcher (wofi replacement): fuzzy search with underlined hits, arrow/enter navigation, keycap footer.

```tsx
<Launcher onLaunch={(app) => run(app.id)} />
<Launcher query="co" />
```

Shown centred at ~22% from the top over a dark blurred scrim.
