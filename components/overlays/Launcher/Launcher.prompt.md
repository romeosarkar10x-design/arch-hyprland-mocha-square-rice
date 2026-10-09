Launcher from hyprland-ui. Use via `window.HyprlandUI.Launcher` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

App launcher (wofi replacement): fuzzy search with underlined hits, arrow/enter navigation, keycap footer.

```tsx
<Launcher onLaunch={(app) => run(app.id)} />
<Launcher query="co" />
```

Shown centred at ~22% from the top over a dark blurred scrim.

## Props

```ts
interface LauncherProps {
  items?: LauncherItem[];
  /** Initial query. */
  query?: string;
  placeholder?: string;
  /** Fires with the chosen item on Enter or click. */
  onLaunch?: (item: LauncherItem) => void;
  onClose?: () => void;
  /** Focus the input on mount. */
  autoFocus?: boolean;
  width?: number;
  className?: string;
}
```
