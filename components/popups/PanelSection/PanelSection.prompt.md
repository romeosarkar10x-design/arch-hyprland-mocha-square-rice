PanelSection from hyprland-ui. Use via `window.HyprlandUI.PanelSection` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Divided block inside a Panel with an optional caps label row.

```tsx
<PanelSection label="threads" aside={<span className="hx-dim">peak 95%</span>}>
  <CoreGrid cores={cores} />
</PanelSection>
```

`flush` removes padding for edge-to-edge content (visualizers, tile grids).

## Props

```ts
interface PanelSectionProps {
  /** Small caps label at the top-left. */
  label?: React.ReactNode;
  /** Right side of the label row, e.g. a figure or a toggle. */
  aside?: React.ReactNode;
  children?: React.ReactNode;
  /** Remove the inner padding (for edge-to-edge content). */
  flush?: boolean;
  className?: string;
}
```
