Stat from hyprland-ui. Use via `window.HyprlandUI.Stat` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Caps label over a large mono figure. Put 2–4 inside a `.hx-stats` grid.

```tsx
<div className="hx-stats">
  <Stat label="used" value="9.4" hint="GiB" accent="mauve" />
  <Stat label="cached" value="4.6" hint="GiB" accent="blue" />
</div>
```

## Props

```ts
interface StatProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Small trailing text after the value, e.g. unit or delta. */
  hint?: React.ReactNode;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  className?: string;
}
```
