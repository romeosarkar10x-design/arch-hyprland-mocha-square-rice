Tooltip from hyprland-ui. Use via `window.HyprlandUI.Tooltip` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Hover card for a bar segment: 3px accent strip on top, key/value rows (optional inline bars), hint footer.

```tsx
<Tooltip title="Memory" subtitle="DDR5 · 32 GiB" icon="memory" accent="mauve"
  rows={[{ label: "ram", value: "9.4 GiB", bar: 31 }, { label: "swap", value: "0.3 GiB", bar: 4 }]}
  hints={[["click", "btop"]]} />
```

## Props

```ts
interface TooltipProps {
  title: string;
  subtitle?: string;
  icon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Colour of the 3px top strip, title and inline bars. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  rows?: TooltipRow[];
  /** Mouse/keyboard hints in the footer, e.g. [["click", "btop"], ["scroll", "volume"]]. */
  hints?: [string, string][];
  children?: React.ReactNode;
  className?: string;
}
```
