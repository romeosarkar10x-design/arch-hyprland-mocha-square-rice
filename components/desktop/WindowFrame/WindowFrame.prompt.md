WindowFrame from hyprland-ui. Use via `window.HyprlandUI.WindowFrame` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

A Hyprland client: no titlebar, 2px border. Focused = rotating mauve→pink→yellow conic border + shadow; unfocused = dimmed body.

```tsx
<WindowFrame focused tag="ghostty" style={{ position: "absolute", inset: 6 }}><Terminal /></WindowFrame>
```

Gaps: 6px to screen edges, 3px between windows.

## Props

```ts
interface WindowFrameProps {
  /** Focused windows get the animated mauve → pink → yellow border and the drop shadow. */
  focused?: boolean;
  /** Small class label on the bottom-right corner (dev aid, like hyprctl clients). */
  tag?: string;
  children?: React.ReactNode;
  onFocus?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
```
