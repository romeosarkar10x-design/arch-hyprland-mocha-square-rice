Button from hyprland-ui. Use via `window.HyprlandUI.Button` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Square button. Icon carries the accent at rest; hover floods the whole button with it.

```tsx
<Button icon="chart" accent="sky" kbd="B">btop</Button>
<Button variant="primary" icon="download">Update</Button>
<Button variant="ghost">Later</Button>
<Button variant="danger" icon="power">Shut down</Button>
```

variant: primary | secondary (default) | ghost | danger. size: sm | md | lg.

## Props

```ts
interface ButtonProps {
  /** Filled (primary), plain surface (secondary), outline only (ghost) or red (danger). */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** sm = 26px, md = 32px, lg = 40px. */
  size?: "sm" | "md" | "lg";
  /** Accent colour token for the icon and hover fill. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Leading icon. */
  icon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Shortcut hint drawn as a keycap at the end. */
  kbd?: string;
  /** Stretch to the container width. */
  block?: boolean;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}
```
