BrowserView from hyprland-ui. Use via `window.HyprlandUI.BrowserView` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Chrome-style body (tabs, omnibox, repo file list) for browser windows in mock-ups.

```tsx
<BrowserView url="github.com/romeosarkar10x/dotfiles" />
```

## Props

```ts
interface BrowserViewProps {
  url?: string;
  tabs?: string[];
  className?: string;
}
```
