Shortcut from hyprland-ui. Use via `window.HyprlandUI.Shortcut` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Key combination drawn as keycaps joined by +.

```tsx
<Shortcut keys={["SUPER", "SHIFT", "Q"]} />
```

## Props

```ts
interface ShortcutProps {
  /** Keys pressed together, e.g. ["SUPER", "R"]. */
  keys: string[];
  className?: string;
}
```
