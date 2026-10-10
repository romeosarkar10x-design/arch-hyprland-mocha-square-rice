import { type Ref } from "react";
import { Bar } from "../bar/bar";
import { BarSegment } from "../bar/bar-segment";
import { Workspaces } from "../bar/workspaces";
import { Icon } from "../foundations/icon";
import { Unit } from "../foundations/unit";
import { level, rate, type Level } from "../lib";
import { demoTrack } from "../popups/media-player";
import type { SystemStats } from "../stats";
import type { DesktopExtra, Popup } from "./desktop";
import type { Win } from "./desktop-layouts";

export interface DesktopBarProps {
  stats: SystemStats;
  layouts: Record<number, Win[]>;
  workspace: number;
  onWorkspace: (id: number) => void;
  /** Title of the focused window. */
  title: string;
  clock: Date;
  popup: Popup | null;
  onPopup: (id: Popup) => void;
  /** Registers a segment so its popup can anchor under it. */
  segmentRef: (id: Popup) => Ref<HTMLButtonElement>;
  /** Pointer entered (id) or left (null) a segment; the Desktop shows its Tooltip. */
  onHover: (id: Popup | null) => void;
  /** Scroll over the quick-settings icon: +1 up, -1 down. */
  onVolumeWheel: (dir: 1 | -1) => void;
  caffeine: boolean;
  onCaffeine: () => void;
  /** Host segments, drawn before the power button. */
  extras?: DesktopExtra[];
}

const loadLevel = (usage: number, temp: number): Level => (usage >= 90 || temp >= 85 ? "crit" : usage >= 60 || temp >= 75 ? "warn" : "ok");

/** The desktop's Waybar: launcher, workspaces and title; media and clock; short live readouts (details in tooltips), caffeine, quick settings and power. */
export function DesktopBar({
  stats,
  layouts,
  workspace,
  onWorkspace,
  title,
  clock,
  popup,
  onPopup,
  segmentRef,
  onHover,
  onVolumeWheel,
  caffeine,
  onCaffeine,
  extras = [],
}: DesktopBarProps) {
  const { cpu: c, gpu: g, mem: m, net: n } = stats;
  const memPct = (m.used / m.total) * 100;
  const wsList = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, apps: (layouts[i + 1] ?? []).map((w) => w.app) }));
  const seg = (id: Popup) => ({
    ref: segmentRef(id),
    open: popup === id,
    onClick: () => onPopup(id),
    onPointerEnter: () => onHover(id),
    onPointerLeave: () => onHover(null),
  });
  return (
    <Bar
      data-component="DesktopBar"
      className="absolute inset-x-0 top-0 z-10"
      left={
        <>
          <BarSegment {...seg("launcher")} variant="launcher" icon="arch" label="Launcher" />
          <Workspaces workspaces={wsList} active={workspace} onSelect={onWorkspace} />
          <BarSegment variant="title" accent="lavender">
            {title}
          </BarSegment>
        </>
      }
      center={
        <>
          <BarSegment {...seg("media")} variant="media" icon="spotify" accent="green">
            {demoTrack.artist}
            {" — "}
            {demoTrack.title}
          </BarSegment>
          <BarSegment {...seg("clock")} variant="clock" icon="clock">
            {clock.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
            {"  "}
            {String(clock.getHours() % 12 || 12).padStart(2, "0")}:{String(clock.getMinutes()).padStart(2, "0")}{" "}
            <Unit>{clock.getHours() < 12 ? "AM" : "PM"}</Unit>
          </BarSegment>
        </>
      }
      right={
        <>
          <BarSegment {...seg("net")} icon="ethernet" accent="sapphire">
            <Icon name="down" />
            {rate(n.rx).replace("/s", "")} <Icon name="up" />
            {rate(n.tx).replace("/s", "")}
          </BarSegment>
          <BarSegment {...seg("cpu")} icon="cpu" accent="sky" divider level={loadLevel(c.usage, c.temp)} spark={c.history}>
            {Math.round(c.usage)}%
          </BarSegment>
          <BarSegment {...seg("gpu")} icon="gpu" accent="green" divider level={loadLevel(g.usage, g.temp)} spark={g.history}>
            {Math.round(g.usage)}%
          </BarSegment>
          <BarSegment {...seg("mem")} icon="memory" accent="mauve" divider level={level(memPct, 75, 90)}>
            {Math.round(memPct)}%
          </BarSegment>
          <BarSegment
            icon={caffeine ? "coffee" : "coffeeOff"}
            accent={caffeine ? "yellow" : "text"}
            divider
            dim={!caffeine}
            className={caffeine ? "bg-yellow text-crust hover:bg-yellow" : undefined}
            onClick={onCaffeine}
            label="Caffeine"
          />
          <BarSegment {...seg("qs")} icon="settings" divider label="Quick settings" onWheel={(e) => onVolumeWheel(e.deltaY < 0 ? 1 : -1)} />
          {extras.map(
            ({ id, segment: s }) =>
              s && (
                <BarSegment key={id} {...seg(id)} icon={s.icon} label={s.label} accent={s.accent} dim={s.dim} divider>
                  {s.children}
                </BarSegment>
              ),
          )}
          <BarSegment {...seg("power")} variant="power" icon="power" label="Power" />
        </>
      }
    />
  );
}
