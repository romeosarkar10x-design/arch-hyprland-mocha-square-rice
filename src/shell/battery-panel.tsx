import { useState } from "react";
import { Icon, Panel, PanelSection, Sparkline, Stat, StatGrid, Toggle, cx, type Accent, type IconName } from "../ui";

export type PowerProfile = "power-saver" | "balanced" | "performance";

export interface BatteryPanelProps {
  /** Charge, 0-100. */
  level?: number;
  charging?: boolean;
  profile?: PowerProfile;
  /** Watts in (charging) or out. */
  rate?: number;
  /** Minutes to full / empty. */
  minutes?: number;
  health?: number;
  cycles?: number;
  /** Charge over the last hours, 0-100. */
  history?: number[];
  className?: string;
}

const PROFILES: { id: PowerProfile; icon: IconName; label: string; accent: Accent }[] = [
  { id: "power-saver", icon: "moon", label: "Saver", accent: "green" },
  { id: "balanced", icon: "gauge", label: "Balanced", accent: "sky" },
  { id: "performance", icon: "bolt", label: "Performance", accent: "peach" },
];

/** upower + power-profiles-daemon: charge, time left, profile switcher, health. */
export function BatteryPanel({
  level = 82,
  charging = true,
  profile: initial = "balanced",
  rate = 34.6,
  minutes = 38,
  health = 94,
  cycles = 212,
  history = [64, 58, 51, 47, 44, 40, 37, 45, 56, 66, 74, 82],
  className,
}: BatteryPanelProps) {
  const [profile, setProfile] = useState(initial);
  const [limit, setLimit] = useState(true);
  const accent: Accent = level <= 15 ? "red" : level <= 30 ? "yellow" : "green";
  const time = `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
  return (
    <Panel
      data-component="BatteryPanel"
      className={className}
      icon="flash"
      accent={accent}
      title="Battery"
      subtitle={charging ? `charging · full in ${time}` : `on battery · ${time} left`}
      width={380}
      live
    >
      <PanelSection>
        <div className="kit-type flex items-center gap-[18px] text-text">
          <BatteryCell level={level} charging={charging} accent={accent} />
          <div className="text-display leading-none font-bold tracking-[-.04em]">
            {level}
            <span className="ml-0.5 text-[18px] text-overlay1">%</span>
          </div>
        </div>
        <Sparkline data={history} max={100} height={36} />
      </PanelSection>
      <PanelSection label="power profile">
        <ProfilePicker value={profile} onChange={setProfile} />
      </PanelSection>
      <PanelSection flush>
        <StatGrid>
          <Stat label={charging ? "in" : "draw"} value={rate.toFixed(1)} hint="W" accent={accent} />
          <Stat label="health" value={health} hint="%" accent="sky" />
          <Stat label="cycles" value={cycles} accent="mauve" />
        </StatGrid>
      </PanelSection>
      <PanelSection>
        <Toggle checked={limit} onChange={setLimit} accent="green" label="Charge limit 80%" description="keeps the cell healthy when docked" />
      </PanelSection>
    </Panel>
  );
}

/** Battery outline with a terminal nub, filled to `level` in the accent; a bolt while charging. */
function BatteryCell({ level, charging, accent }: { level: number; charging: boolean; accent: Accent }) {
  return (
    <div
      data-component="BatteryCell"
      className="relative h-[54px] w-32 p-1 inset-ring-2 inset-ring-surface2 after:absolute after:top-3.5 after:-right-[7px] after:h-[18px] after:w-[5px] after:bg-surface2"
      style={{ ["--hx-acc" as string]: `var(--hx-${accent})` }}
    >
      <i className="block h-full bg-acc" style={{ width: `${level}%` }} />
      {charging && <Icon name="bolt" size={18} className="absolute top-1/2 left-1/2 -translate-1/2 text-crust" />}
    </div>
  );
}

/** power-profiles-daemon switcher; the active profile floods with its accent. */
function ProfilePicker({ value, onChange }: { value: PowerProfile; onChange: (p: PowerProfile) => void }) {
  return (
    <div data-component="ProfilePicker" className="kit-type grid grid-cols-3 gap-px bg-surface0 text-text" role="radiogroup">
      {PROFILES.map((p) => {
        const on = p.id === value;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={on}
            className={cx(
              "unbutton flex cursor-pointer flex-col items-start gap-2 p-3 font-hx text-[11.5px] font-bold transition-[background-color]",
              on ? "bg-acc text-crust" : "bg-mantle text-text hover:bg-base",
            )}
            style={{ ["--hx-acc" as string]: `var(--hx-${p.accent})` }}
            onClick={() => onChange(p.id)}
          >
            <Icon name={p.icon} size={18} className={on ? "text-crust" : "text-acc"} />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
