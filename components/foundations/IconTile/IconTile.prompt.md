IconTile from hyprland-ui. Use via `window.HyprlandUI.IconTile` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Square tinted tile holding an icon, tinted by its accent.

```tsx
<IconTile icon="spotify" accent="green" size={36} />
```

Used in Panel headers, Toasts and Launcher rows. Pick the accent of the app or module.

## Props

```ts
interface IconTileProps {
  icon: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Tile edge in px. */
  size?: number;
  className?: string;
}
```
