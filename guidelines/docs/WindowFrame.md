---
category: Desktop
---

A Hyprland client: no titlebar, 2px border. Focused = rotating mauve→pink→yellow conic border + shadow; unfocused = dimmed body.

```tsx
<WindowFrame focused tag="ghostty" style={{ position: "absolute", inset: 6 }}><Terminal /></WindowFrame>
```

Gaps: 6px to screen edges, 3px between windows.
