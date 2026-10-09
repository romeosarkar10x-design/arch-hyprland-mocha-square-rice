import { useState } from "react";
import type { SparklineProps } from "../../components/data/Sparkline/Sparkline";
import type { StatProps } from "../../components/data/Stat/Stat";
import { Icon, Panel, PanelSection, Toggle, type Accent, type IconName } from "../ds";
import { ui } from "../hyprland-ui";
import "./shell.css";

const Sparkline = ui<SparklineProps & { accent?: Accent }>("Sparkline");
const Stat = ui<StatProps>("Stat");

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
      className={className}
      icon="flash"
      accent={accent}
      title="Battery"
      subtitle={charging ? `charging · full in ${time}` : `on battery · ${time} left`}
      width={380}
      live
    >
      <PanelSection>
        <div className="rx-batt">
          <div className="rx-batt-cell" style={{ ["--hx-acc" as string]: `var(--hx-${accent})` }}>
            <i style={{ width: `${level}%` }} />
            {charging && <Icon name="bolt" size={18} className="rx-batt-bolt" />}
          </div>
          <div className="rx-batt-pct">
            {level}
            <span>%</span>
          </div>
        </div>
        <Sparkline data={history} max={100} height={36} accent={accent} />
      </PanelSection>
      <PanelSection label="power profile">
        <div className="rx-profiles" role="radiogroup">
          {PROFILES.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={p.id === profile}
              className={p.id === profile ? "is-on" : undefined}
              style={{ ["--hx-acc" as string]: `var(--hx-${p.accent})` }}
              onClick={() => setProfile(p.id)}
            >
              <Icon name={p.icon} size={18} />
              {p.label}
            </button>
          ))}
        </div>
      </PanelSection>
      <PanelSection flush>
        <div className="hx-stats">
          <Stat label={charging ? "in" : "draw"} value={rate.toFixed(1)} hint="W" accent={accent} />
          <Stat label="health" value={health} hint="%" accent="sky" />
          <Stat label="cycles" value={cycles} accent="mauve" />
        </div>
      </PanelSection>
      <PanelSection>
        <Toggle checked={limit} onChange={setLimit} accent="green" label="Charge limit 80%" description="keeps the cell healthy when docked" />
      </PanelSection>
    </Panel>
  );
}
