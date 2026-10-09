IconButton from hyprland-ui. Use via `window.HyprlandUI.IconButton` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Icon-only square button for transport controls, close buttons and toolbars.

```tsx
<IconButton icon="play" label="Play" variant="primary" accent="green" size="lg" />
<IconButton icon="shuffle" label="Shuffle" active accent="green" />
```

`label` is required (accessible name).

## Props

```ts
interface IconButtonProps {
  icon: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Accessible name (also used as the native tooltip). */
  label: string;
  /** sm = 26px, md = 32px, lg = 44px. */
  size?: "sm" | "md" | "lg";
  /** primary fills with the accent; plain is transparent until hover. */
  variant?: "plain" | "primary" | "outline";
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Pressed / on state for toggles like shuffle or mute. */
  active?: boolean;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}
```
