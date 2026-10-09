MediaPlayer from hyprland-ui. Use via `window.HyprlandUI.MediaPlayer` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

MPRIS now-playing: square generated cover (or artUrl), title, scrubber, transport, shuffle/repeat.

```tsx
<MediaPlayer track={{ title: "Midnight City", artist: "M83", length: 243, art: ["mauve", "peach"] }} position={97} />
<MediaPlayer variant="compact" track={demoTrack} />
```

## Props

```ts
interface MediaPlayerProps {
  track: Track;
  /** Player name shown above the title, e.g. "Spotify". */
  player?: string;
  playerIcon?: "account" | "alert" | "app" | "arch" | "down" | "up" | "bell" | "bellOff" | "bluetooth" | "calculator" | "calendar" | "chart" | "check" | "checkCircle" | "chevronLeft" | "chevronRight" | (string & {}) /* +71 more */;
  /** Controlled playback. Omit to let the player run itself. */
  playing?: boolean;
  /** Start position in seconds. */
  position?: number;
  onPlayPause?: (playing: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  /** compact = single row for the bar's centre dropdown. */
  variant?: "full" | "compact";
  className?: string;
}
```
