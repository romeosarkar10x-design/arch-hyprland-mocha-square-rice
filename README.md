# hyprland-ui: conventions

A Hyprland/Waybar desktop UI kit. Catppuccin Mocha, **square corners everywhere** (`--hx-radius: 0`), asiLonoM monospace. Every component is dark-only.

## Always wrap in `<Surface>`

Components assume a dark ground. Put a design's root in `Surface`, or ghost buttons and hairlines vanish on white:

```jsx
import { Surface, Panel, PanelSection, Meter, Button } from "./src/ui";

<Surface tone="crust" padding={24}>
  <Panel icon="disk" accent="blue" title="Storage" subtitle="990 PRO · btrfs"
         actions={<Button icon="folder" accent="blue">Open /</Button>}>
    <PanelSection label="subvolumes">
      <Meter label="@home" value={46} readout="858 GiB" accent="blue" />
    </PanelSection>
  </Panel>
</Surface>
```

`tone`: `crust` (bar/page), `mantle` (popups), `base` (windows), `wallpaper` (gradient desktop backdrop).

## Accents

Every coloured component takes `accent`: a Mocha colour name (`mauve pink yellow peach red green sky sapphire teal blue lavender text`). Keep the module mapping consistent with the bar:

| module | accent |
|---|---|
| network | `sapphire` |
| CPU | `sky` |
| GPU | `green` |
| memory | `mauve` |
| audio | `yellow` |
| media / Spotify | `green` |
| window title | `lavender` |
| power / danger | `red` |

## Levels

Data components (`Meter`, `Gauge`, `CoreGrid`, `BarSegment level`) colour by threshold: below `warn` (default 60) uses the accent, `warn` and above is `yellow`, `crit` (default 90) and above is `red`. Pass `levels={false}` for values where high is not bad (fan speed, clock).

## Live data

`CpuPanel`, `GpuPanel`, `MemoryPanel`, `NetworkPanel`, `AudioPanel` and `Desktop` simulate a live system (Ryzen 9 9900X, RTX 3090 Ti, 30.5 GiB) when given no `data`. Pass `data` (shape from `initialStats()`) to show fixed numbers, or `paused` to freeze. `ClockPanel` takes `now` to pin the time.

## Tokens and utility classes

- CSS vars are `--hx-*`: palette (`--hx-crust` … `--hx-lavender`), `--hx-font`, `--hx-text-xs…display`, `--hx-space-1…5`, `--hx-bar-height` (34px), `--hx-shadow-popup`.
- Utility classes: `hx-stats` (grid of `Stat` cells), `hx-caps` (small tracked uppercase label), `hx-dim` / `hx-faint` (muted text), `hx-small`, `hx-spacer` (flex filler), colour classes `hx-<accent>` (e.g. `hx-green`).
- Never add `border-radius`. Separate with 1px `--hx-surface0` hairlines, not shadows.

## Composition

- A bar is `Bar` with `left`/`center`/`right` slots filled by `BarSegment`s and `Workspaces`; put `divider` on every right-side segment after the first.
- Popups are `Panel` + `PanelSection`s; footers go in `actions`.
- Full screens: `<Desktop />` renders a 1920×1080 working desktop (bar, tiled windows, popups, launcher, power menu). Use `workspace` and `openPopup` to pick the state.

# Source layout

The kit lives in `src/ui/`, plain TypeScript + React:

- `src/ui/index.ts` — the entry point. Import components from here; it also pulls in the fonts and `hyprland-ui.css`.
- `src/ui/<group>/<Name>.tsx` — one component per file with its exported `<Name>Props`, next to `<Name>.stories.tsx`. Groups: `foundations`, `controls`, `data`, `bar`, `popups`, `overlays`, `desktop`.
- `src/ui/lib.ts` (`Accent`, `cx`, `level`, `bytes`, canvas and timer hooks), `src/ui/icons.ts` (`icons`, `IconName`), `src/ui/stats.ts` (the simulated system behind the live panels).
- `src/ui/hyprland-ui.css` — tokens and every component's styles.
- `fonts/` — asiLonoM `@font-face` files.
- `guidelines/docs/<Name>.md` — usage guidance per component; each story's docs page shows it.

## Tokens

63 CSS custom properties, declared at the top of `src/ui/hyprland-ui.css`.

- **color** (12): `--hx-surface0`, `--hx-surface1`, `--hx-surface2`, …
- **spacing** (7): `--hx-gap-in`, `--hx-gap-out`, `--hx-space-1`, …
- **typography** (1): `--hx-font`
- **radius** (1): `--hx-radius`
- **shadow** (2): `--hx-shadow-window`, `--hx-shadow-popup`
- **other** (40): `--hx-crust`, `--hx-mantle`, `--hx-base`, …

## Components

### popups
- `AudioPanel` — PipeWire popup: output volume, live spectrum, now playing, output device picker and mic level.
- `Calendar` — Monday-first month grid with ISO weeks, event dots, month paging and a selectable day.
- `ClockPanel` — Clock popup: huge time with seconds, date line, world clocks, month calendar and the agenda.
- `CpuPanel` — CPU popup: load / temperature / power gauges, 60 s history, per-core heatmap, clock meter.
- `GpuPanel` — NVIDIA popup: load / temperature / power gauges, power-draw history, VRAM, fan and clock meters.
- `MediaPlayer` — MPRIS now-playing card: square cover, title, scrubber with times, transport and shuffle/repeat.
- `MemoryPanel` — Memory popup: used / cached / free stack, swap meter and the heaviest processes by PSS.
- `NetworkPanel` — Network popup: mirrored down/up traffic graph, rates, addresses and session totals.
- `Panel` — Popup shell for every rich bar dropdown. Mantle body, hairline frame,
- `PanelSection` — A divided block inside a Panel.
- `QuickSettings` — Toggle tiles for desktop modes (caffeine, DND, night light...), plus brightness and volume sliders.

### bar
- `Bar` — The top panel (Waybar). 34px crust strip with a 2px surface0 underline.
- `BarSegment` — One module on the bar. Colour lives in its text hover lifts it to surface0.
- `Tooltip` — Hover card for a bar segment: accent strip on top, key/value rows, hint footer.
- `Workspaces` — Hyprland workspace strip. Empty  overlay0, occupied  subtext0 with app icons,

### desktop
- `BrowserView` — Minimal Chrome-style body (tab strip, omnibox, page skeleton) to fill browser windows in mock-ups.
- `CodeView` — Neovim-style editor body: line numbers, cursor line, syntax colours and a mode status line.
- `Desktop` — The whole desktop, interactive: wallpaper, live Waybar, dwindle-tiled
- `Terminal` — Ghostty-style terminal body: starship-like two-tone prompt, coloured output, block cursor.
- `Wallpaper` — Generated desktop background in the palette. Square grid, no gradients with rounded shapes.
- `WindowFrame` — A Hyprland client. No titlebar a 2px border whose gradient slowly rotates

### controls
- `Button` — Square button. Hover floods it with its accent the icon carries the colour at rest.
- `IconButton` — Icon-only square button for transport controls, close buttons and toolbars.
- `Slider` — Drag, click, wheel or arrow-key slider with a square thumb. Used for volume and brightness.
- `Toggle` — Square switch. The knob slides with a slight overshoot on fills with the accent.

### data
- `CoreGrid` — Per-core heatmap. Each square tints toward the accent by its load and flips
- `Gauge` — 270 segmented arc gauge. Segments light up to the value the arc turns
- `Graph` — History graph on canvas. Square step-free lines with a soft gradient fill,
- `Meter` — Segmented cell meter with a caption row. Reads like an LED bar.
- `Sparkline` — Tiny bar sparkline that inherits the text colour. Sits inside bar segments.
- `StackBar` — Proportional stacked bar with a legend, e.g. RAM used / cached / free.
- `Stat` — Labelled figure: caps label over a large mono value. Used in grids of 24.
- `Visualizer` — cava-style spectrum on canvas with falling peak caps and a bass-to-treble gradient.

### foundations
- `Icon` — A Material Design icon drawn as inline SVG. Inherits colour and size from the text around it.
- `IconTile` — Square tinted tile holding an icon. Headers, toasts and list rows use it.
- `Kbd` — A keycap. Used for shortcut hints in buttons, menus and the launcher footer.
- `Shortcut` — A key combination drawn as keycaps joined by a thin plus.
- `Surface` — Root wrapper. Every hyprland-ui screen is dark: wrap the page (or any
- `Unit` — Dim unit suffix inside a bar readout, e.g. UnitW/Unit.

### overlays
- `Launcher` — App launcher (replaces wofi): fuzzy search with highlighted hits, arrow-key selection, Enter to launch.
- `PowerMenu` — Session menu. Safe actions fire on click or their key reboot and shutdown
- `Toast` — Notification card (mako/swaync replacement) with countdown line, actions and slide-in.
- `ToastStack` — Column of toasts pinned top-right under the bar.
