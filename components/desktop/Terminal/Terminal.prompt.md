Terminal from hyprland-ui. Use via `window.HyprlandUI.Terminal` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Ghostty-style terminal body: sapphire cwd, pink branch, mauve ❯ prompt, block cursor. Default content is fastfetch + git status.

```tsx
<Terminal lines={[{ cmd: "ls" }, { out: "bash  ghostty  hyprland  waybar" }]} />
```

## Props

```ts
interface TerminalProps {
  lines?: TerminalLine[];
  /** Working directory shown in the prompt. */
  cwd?: string;
  /** Show the blinking block cursor on a final empty prompt. */
  cursor?: boolean;
  className?: string;
}
```
