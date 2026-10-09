import { useState } from "react";
import { Slider } from "../controls/Slider";
import { Icon } from "../foundations/Icon";
import { accentVar, cx, type Accent } from "../lib";
import { Panel } from "./Panel";
import { PanelSection } from "./PanelSection";
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
    <div className={cx("hx-qs", className)} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {tiles.map((t) => {
        const on = state[t.id];
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            className={cx("hx-qs-tile", on && "is-on")}
            style={{ ["--hx-acc" as string]: accentVar(t.accent) }}
            onClick={() => {
              setState({ ...state, [t.id]: !on });
              onToggle?.(t.id, !on);
            }}
          >
            <Icon name={t.icon} className="hx-qs-icon" />
            <span className="hx-qs-label">{t.label}</span>
            <span className="hx-qs-detail">
              {on
                ? t.detail === "off" || t.detail === "idle allowed"
                  ? "on"
                  : t.detail
                : t.detail === "off" || t.detail === "idle allowed"
                  ? t.detail
                  : "off"}
            </span>
          </button>
        );
      })}
    </div>
  );
  if (bare) return grid;
  return (
    <Panel width={400} icon="settings" accent="lavender" title="Quick settings" subtitle="romeo@archlinux · up 3h 12m">
      <PanelSection flush>{grid}</PanelSection>
      <PanelSection>
        <Slider label="Brightness" icon="sun" defaultValue={72} accent="peach" ticks={0} />
        <Slider label="Volume" icon="volumeMedium" defaultValue={64} accent="yellow" ticks={0} />
      </PanelSection>
    </Panel>
  );
}
