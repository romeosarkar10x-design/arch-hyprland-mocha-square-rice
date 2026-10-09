Visualizer from hyprland-ui. Use via `window.HyprlandUI.Visualizer` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

cava-style audio spectrum on canvas with falling peak caps and a bass→treble gradient. Runs a built-in simulation when `bars` is omitted.

```tsx
<Visualizer height={90} from="mauve" to="sky" />
<Visualizer variant="mirror" from="green" to="teal" />
```

Pass `bars` (0–100 per bar) to drive it from real data.

## Props

```ts
interface VisualizerProps {
  /** Bar heights 0–100 (e.g. cava output). Omit to run the built-in simulated spectrum. */
  bars?: number[];
  /** Number of bars when simulating. */
  count?: number;
  /** Simulated playback state; false settles to a flat line. */
  playing?: boolean;
  /** Height in px or any CSS length (e.g. "100%"). */
  height?: string | number;
  /** "bars" = square columns with peak caps; "mirror" = columns reflected around the middle. */
  variant?: "bars" | "mirror";
  /** Gradient from the bass end to the treble end. */
  from?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  to?: "mauve" | "pink" | "yellow" | "peach" | "red" | "green" | "sky" | "sapphire" | "teal" | "blue" | "lavender" | "text";
  className?: string;
}
```
