Wallpaper from hyprland-ui. Use via `window.HyprlandUI.Wallpaper` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Generated background: aurora (soft glows over a square grid with a faint Arch mark), tiles (dwindle blocks) or an image.

```tsx
<Wallpaper variant="aurora" />
```

Absolutely positioned; place inside a relative container.

## Props

```ts
interface WallpaperProps {
  /** aurora = soft mauve/blue glows over a square grid; tiles = dwindle blocks; image = `src`. */
  variant?: "image" | "aurora" | "tiles";
  src?: string;
  className?: string;
  style?: React.CSSProperties;
}
```
