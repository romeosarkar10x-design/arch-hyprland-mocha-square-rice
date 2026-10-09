Bar from hyprland-ui. Use via `window.HyprlandUI.Bar` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

The top panel (Waybar): 36px crust strip with a 2px surface0 underline, three slots, centre pinned to the true middle.

```tsx
<Bar
  left={<><BarSegment variant="launcher" icon="arch" /><Workspaces workspaces={ws} active={1} /></>}
  center={<BarSegment variant="clock" icon="clock">Sat 03 Oct  09:41</BarSegment>}
  right={<BarSegment variant="power" icon="power" />}
/>
```

Order on the right: network, cpu, gpu, memory, audio, caffeine, tray, power — every one after network has `divider`.

## Props

```ts
interface BarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
```
