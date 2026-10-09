Kbd from hyprland-ui. Use via `window.HyprlandUI.Kbd` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Keycap for shortcut hints.

```tsx
<Kbd>SUPER</Kbd> <Kbd>↵</Kbd>
```

Use inside Buttons (`kbd` prop does it for you), launcher footers and help text.

## Props

```ts
interface KbdProps {
  /** Key label, e.g. "SUPER", "↵", "Esc". */
  children: React.ReactNode;
  className?: string;
}
```
