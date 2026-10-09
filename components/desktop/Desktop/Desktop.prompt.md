Desktop from hyprland-ui. Use via `window.HyprlandUI.Desktop` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

The whole desktop, interactive: wallpaper, live Waybar, dwindle-tiled windows per workspace with the animated focus border, popups anchored under their segments, launcher, power menu and notifications.

```tsx
<Desktop />
<Desktop openPopup="cpu" notifications={false} />
```

Keys: 1–9 switch workspace, / opens the launcher, Esc closes. Use this as the page for full-screen mock-ups.

## Props

```ts
interface DesktopProps {
  /** Workspace shown first. */
  workspace?: number;
  /** Popup open on load: cpu, gpu, mem, net, audio, clock, qs, media, power or launcher. */
  openPopup?: "clock" | "cpu" | "gpu" | "power" | "launcher" | "media" | "mem" | "net" | "audio" | "qs";
  /** Show demo notifications a few seconds after load. */
  notifications?: boolean;
  /** Freeze live data (for screenshots). */
  paused?: boolean;
  /** Wallpaper variant. */
  wallpaper?: "image" | "aurora" | "tiles";
  width?: string | number;
  height?: string | number;
  className?: string;
}
```
