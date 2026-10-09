---
category: Bar
---

Hyprland workspace strip with app icons. Focused = surface1 block + mauve top strip; urgent blinks red. Wheel cycles.

```tsx
<Workspaces active={2} onSelect={setWs} workspaces={[{ id: 1, apps: ["code", "ghostty"] }, { id: 2, apps: ["chrome"] }, { id: 3 }, { id: 4, urgent: true, apps: ["chat"] }]} />
```
