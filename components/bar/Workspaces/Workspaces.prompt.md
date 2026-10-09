Workspaces from hyprland-ui. Use via `window.HyprlandUI.Workspaces` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Hyprland workspace strip with app icons. Focused = surface1 block + mauve top strip; urgent blinks red. Wheel cycles.

```tsx
<Workspaces active={2} onSelect={setWs} workspaces={[{ id: 1, apps: ["code", "ghostty"] }, { id: 2, apps: ["chrome"] }, { id: 3 }, { id: 4, urgent: true, apps: ["chat"] }]} />
```

## Props

```ts
interface WorkspacesProps {
  workspaces: Workspace[];
  /** Focused workspace id. */
  active: number;
  onSelect?: (id: number) => void;
  /** Show app icons after the number. */
  showApps?: boolean;
  className?: string;
}
```
