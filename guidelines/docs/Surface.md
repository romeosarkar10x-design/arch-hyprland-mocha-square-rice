---
category: Foundations
---

Root wrapper. Every hyprland-ui screen is dark: wrap the page or any standalone component in `<Surface>` so it sits on crust with the text colour and asiLonoM applied.

```tsx
<Surface tone="crust" padding={24}>
  <CpuPanel />
</Surface>
<Surface tone="wallpaper"><Toast app="pacman" title="14 updates" /></Surface>
```

tone: crust (screen, default) | mantle (popup body) | base (window body) | wallpaper (grid + glows, for floating overlays).
