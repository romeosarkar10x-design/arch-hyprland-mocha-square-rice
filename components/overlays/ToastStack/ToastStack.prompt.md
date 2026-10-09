ToastStack from hyprland-ui. Use via `window.HyprlandUI.ToastStack` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Column of toasts, 8px apart; the Desktop pins it top-right under the bar.

```tsx
<ToastStack><Toast ... /><Toast ... /></ToastStack>
```

## Props

```ts
interface ToastStackProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
```
