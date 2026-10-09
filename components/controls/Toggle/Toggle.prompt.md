Toggle from hyprland-ui. Use via `window.HyprlandUI.Toggle` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Square switch with an overshooting knob. Optional label and description make it a full settings row.

```tsx
<Toggle label="Blur" description="layer blur on bar and popups" defaultChecked accent="mauve" />
```

## Props

```ts
interface ToggleProps {
  /** Controlled state. Omit to let the toggle manage itself from `defaultChecked`. */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  accent?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  /** Visible label to the left of the switch. */
  label?: React.ReactNode;
  /** Secondary line under the label. */
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}
```
