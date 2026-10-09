NetworkPanel from hyprland-ui. Use via `window.HyprlandUI.NetworkPanel` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Ethernet popup: mirrored down/up traffic graph, live rates, address/gateway/dns, session totals.

```tsx
<NetworkPanel />
```

## Props

```ts
interface NetworkPanelProps {
  data?: NetStats;
  paused?: boolean;
  className?: string;
}
```
