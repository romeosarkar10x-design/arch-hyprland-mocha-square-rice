Surface from hyprland-ui. Use via `window.HyprlandUI.Surface` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Root wrapper. Every hyprland-ui screen is dark: wrap the page or any standalone component in `<Surface>` so it sits on crust with the text colour and MonoLisa applied.

```tsx
<Surface tone="crust" padding={24}>
  <CpuPanel />
</Surface>
<Surface tone="wallpaper"><Toast app="pacman" title="14 updates" /></Surface>
```

tone: crust (screen, default) | mantle (popup body) | base (window body) | wallpaper (grid + glows, for floating overlays).

## Props

```ts
interface SurfaceProps {
  /** Background: crust (screen), mantle (popup body), base (window body) or the aurora wallpaper. */
  tone?: "crust" | "mantle" | "base" | "wallpaper";
  /** Inner padding in px. */
  padding?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
```
