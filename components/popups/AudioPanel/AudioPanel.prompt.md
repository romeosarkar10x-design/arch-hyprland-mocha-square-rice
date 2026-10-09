AudioPanel from hyprland-ui. Use via `window.HyprlandUI.AudioPanel` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

PipeWire popup: output volume slider with mute, live spectrum, now playing, output device picker, mic level.

```tsx
<AudioPanel volume={64} />
```

## Props

```ts
interface AudioPanelProps {
  outputs?: AudioDevice[];
  /** Selected output id. */
  output?: string;
  volume?: number;
  muted?: boolean;
  micVolume?: number;
  track?: Track;
  onOutputChange?: (id: string) => void;
  onVolumeChange?: (v: number) => void;
  className?: string;
}
```
