ClockPanel from hyprland-ui. Use via `window.HyprlandUI.ClockPanel` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Clock popup: huge time with seconds, world clocks, month calendar and agenda.

```tsx
<ClockPanel />
<ClockPanel now={new Date(2026, 9, 3, 21, 41, 7)} />
```

Pass `now` for a frozen frame.

## Props

```ts
interface ClockPanelProps {
  /** Fixed "now" for screenshots. Omit for a live ticking clock. */
  now?: Date;
  events?: CalendarEvent[];
  /** Extra zones shown under the time, e.g. [["Berlin", "Europe/Berlin"]]. */
  zones?: [string, string][];
  className?: string;
}
```
