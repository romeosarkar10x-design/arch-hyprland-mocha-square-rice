Icon from hyprland-ui. Use via `window.HyprlandUI.Icon` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Material Design icon as inline SVG. Inherits colour and font size.

```tsx
<Icon name="cpu" />
<Icon name="spotify" size={24} color="var(--hx-green)" />
```

Names come from the exported `icons` table (e.g. arch, cpu, gpu, memory, ethernet, volumeHigh, spotify, chrome, ghostty, power, lock). Never use emoji or other icon sets.

## Props

```ts
interface IconProps {
  /** Icon to draw, from the `icons` table. */
  name: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Size in px or any CSS length. Defaults to 1em so it follows the surrounding font size. */
  size?: string | number;
  /** CSS colour. Defaults to currentColor. */
  color?: string;
  /** Accessible label; when omitted the icon is decorative (aria-hidden). */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}
```
