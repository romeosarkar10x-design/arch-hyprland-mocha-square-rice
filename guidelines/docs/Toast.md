---
category: Overlays
---

Notification card: accent top strip, app tile, actions row, countdown line that pauses on hover.

```tsx
<Toast app="pacman" appIcon="package" accent="sapphire" title="14 updates" body="linux 7.2.3 · mesa" actions={[{ label: "Update" }, { label: "Later" }]} timeout={8000} />
```

urgency="critical" turns it red.
