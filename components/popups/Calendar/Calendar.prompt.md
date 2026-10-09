Calendar from hyprland-ui. Use via `window.HyprlandUI.Calendar` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<Surface>` (full provider chain in README.md — components read theme/i18n from that context).

Monday-first month grid with ISO weeks, event dots and month paging. Today is a solid mauve square.

```tsx
<Calendar today={new Date(2026, 9, 3)} events={[{ date: "2026-10-05", title: "Review", accent: "mauve" }]} />
```

## Props

```ts
interface CalendarProps {
  /** "Today". Defaults to the real date. */
  today?: Date;
  /** Month shown first (defaults to today's month). */
  month?: Date;
  /** Days with a dot marker. */
  events?: CalendarEvent[];
  /** Show ISO week numbers in a left column. */
  weekNumbers?: boolean;
  onSelect?: (date: Date) => void;
  className?: string;
}
```
