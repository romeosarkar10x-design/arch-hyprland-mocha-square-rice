import { useState } from "react";
import { Slider } from "../controls/slider";
import { Icon } from "../foundations/icon";
import { accentVar, cx, type Accent } from "../lib";
import { Panel } from "./panel";
import { PanelSection } from "./panel-section";
import type { IconName } from "../icons";

const DEFAULT_TILES: QuickTile[] = [
  { id: "caffeine", icon: "coffee", label: "Caffeine", detail: "idle allowed", accent: "yellow" },
  { id: "dnd", icon: "bellOff", label: "Do not disturb", detail: "off", accent: "red" },
  { id: "night", icon: "moon", label: "Night light", detail: "4200 K", on: true, accent: "peach" },
  { id: "bt", icon: "bluetooth", label: "Bluetooth", detail: "WH-1000XM5", on: true, accent: "blue" },
  { id: "rec", icon: "record", label: "Record", detail: "wf-recorder", accent: "red" },
  { id: "game", icon: "gamepad", label: "Game mode", detail: "blur + anim off", accent: "green" },
];

export interface QuickTile {
  id: string;
  icon: IconName;
  label: string;
  /** Status line; "off" / "idle allowed" flip to "on" when toggled. */
  detail?: string;
  /** Initial state. */
  on?: boolean;
  accent?: Accent;
}

export interface QuickSettingsProps {
  tiles?: QuickTile[];
  /** Columns in the tile grid. */
  columns?: number;
  onToggle?: (id: string, on: boolean) => void;
  /** Render just the grid (no Panel chrome or sliders). */
  bare?: boolean;
  className?: string;
}

/** Toggle tiles for desktop modes (caffeine, DND, night light, bluetooth, record, game mode) plus brightness/volume. On tiles flood with their accent. */
export function QuickSettings({ tiles = DEFAULT_TILES, columns = 3, onToggle, bare, className }: QuickSettingsProps) {
  const [state, setState] = useState(() => Object.fromEntries(tiles.map((t) => [t.id, !!t.on])));
  const grid = (
    <div
      data-component="QuickSettingsGrid"
      className={cx("kit-type grid gap-px bg-surface0 text-text", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {tiles.map((t) => (
        <QuickTileButton
          key={t.id}
          tile={t}
          on={!!state[t.id]}
          onClick={() => {
            const on = !state[t.id];
            setState({ ...state, [t.id]: on });
            onToggle?.(t.id, on);
          }}
        />
      ))}
    </div>
  );
  if (bare) return grid;
  return (
    <Panel data-component="QuickSettings" width={400} icon="settings" accent="lavender" title="Quick settings" subtitle="romeo@archlinux · up 3h 12m">
      <PanelSection flush>{grid}</PanelSection>
      <PanelSection>
        <Slider label="Brightness" icon="sun" defaultValue={72} accent="peach" ticks={0} />
        <Slider label="Volume" icon="volumeMedium" defaultValue={64} accent="yellow" ticks={0} />
      </PanelSection>
    </Panel>
  );
}

/** One toggle tile; floods with its accent when on. */
function QuickTileButton({ tile: t, on, onClick }: { tile: QuickTile; on: boolean; onClick: () => void }) {
  // "off" / "idle allowed" describe the off state, so they read "on" when toggled; any other detail describes the on state.
  const offDetail = t.detail === "off" || t.detail === "idle allowed";
  return (
    <button
      type="button"
      data-component="QuickTileButton"
      aria-pressed={on}
      className={cx(
        "unbutton flex min-h-[84px] cursor-pointer flex-col gap-0.5 bg-mantle p-3 text-left text-text",
        "transition-[background-color,color] duration-(--hx-med) hover:bg-base",
        on && "bg-acc text-crust hover:bg-[color-mix(in_srgb,var(--hx-acc)_85%,white)]",
      )}
      style={{ ["--hx-acc" as string]: accentVar(t.accent) }}
      onClick={onClick}
    >
      <Icon name={t.icon} className={cx("mb-auto text-[20px] transition-colors duration-(--hx-med)", on ? "text-crust" : "text-acc")} />
      <span className="mt-2.5 text-[12px] font-bold">{t.label}</span>
      <span className={cx("text-[10.5px]", on ? "text-crust opacity-70" : "text-overlay1")}>
        {on ? (offDetail ? "on" : t.detail) : offDetail ? t.detail : "off"}
      </span>
    </button>
  );
}
