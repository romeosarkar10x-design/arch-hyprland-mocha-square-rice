Panel from hyprland-ui. Use via `window.HyprlandUI.Panel` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Shell for every rich bar dropdown: mantle body, hairline frame, accent corner brackets, icon-tile header, divided sections, crust action footer.

```tsx
<Panel icon="cpu" accent="sky" title="Processor" subtitle="Ryzen 9 9900X" live actions={<Button icon="chart">btop</Button>}>
  <PanelSection label="load · 60 s"><Graph series={[...]} /></PanelSection>
</Panel>
```

Default width 440. Compose PanelSection children; use Stat/Meter/Graph/Gauge inside.

## Props

```ts
interface PanelProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Drives the corner brackets, the icon tile and any child that reads --hx-acc. */
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Shows a pulsing LIVE marker in the header. */
  live?: boolean;
  /** Extra header content on the right (replaces the LIVE marker). */
  headerAside?: React.ReactNode;
  /** Footer action row (buttons). */
  actions?: React.ReactNode;
  /** Width in px. */
  width?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
```
