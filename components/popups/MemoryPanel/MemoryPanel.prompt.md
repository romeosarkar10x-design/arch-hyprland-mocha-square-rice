MemoryPanel from hyprland-ui. Use via `window.HyprlandUI.MemoryPanel` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Memory popup: used/cached/free stack, swap meter, heaviest processes by PSS.

```tsx
<MemoryPanel />
```

## Props

```ts
interface MemoryPanelProps {
  data?: MemStats;
  paused?: boolean;
  className?: string;
}
```
