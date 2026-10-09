PowerMenu from hyprland-ui. Use via `window.HyprlandUI.PowerMenu` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Session menu: lock, log out, suspend fire on click/key; reboot and shut down must be held until the tile fills.

```tsx
<PowerMenu onAction={(id) => console.log(id)} />
```

## Props

```ts
interface PowerMenuProps {
  actions?: PowerAction[];
  /** How long a destructive action must be held. */
  holdMs?: number;
  onAction?: (id: string) => void;
  /** Uptime / user line under the grid. */
  footer?: React.ReactNode;
  className?: string;
}
```
