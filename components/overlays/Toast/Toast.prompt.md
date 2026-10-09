Toast from hyprland-ui. Use via `window.HyprlandUI.Toast` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Notification card: accent top strip, app tile, actions row, countdown line that pauses on hover.

```tsx
<Toast app="pacman" appIcon="package" accent="sapphire" title="14 updates" body="linux 7.2.3 · mesa" actions={[{ label: "Update" }, { label: "Later" }]} timeout={8000} />
```

urgency="critical" turns it red.

## Props

```ts
interface ToastProps {
  /** App name in the meta line. */
  app: string;
  appIcon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  title: string;
  body?: React.ReactNode;
  /** Strip, tile and countdown colour. Critical notifications use red. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  urgency?: "low" | "normal" | "critical";
  /** e.g. "now", "2m". */
  time?: string;
  actions?: ToastAction[];
  /** Auto-dismiss after this many ms (countdown line pauses on hover). 0 = sticky. */
  timeout?: number;
  onClose?: () => void;
  className?: string;
}
```
