CodeView from hyprland-ui. Use via `window.HyprlandUI.CodeView` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Neovim-style editor body: relative line numbers, cursor line, tiny Lua highlighter and a mode status line.

```tsx
<CodeView file="hyprland.lua" mode="NORMAL" cursorLine={8} />
```

## Props

```ts
interface CodeViewProps {
  /** File name in the status line. */
  file?: string;
  /** Source lines; tokens get coloured by a tiny Lua/JS-ish highlighter. */
  code?: string;
  /** 1-based line holding the cursor. */
  cursorLine?: number;
  /** Vim mode in the status line. */
  mode?: "NORMAL" | "INSERT" | "VISUAL";
  className?: string;
}
```
