import { useState } from "react";
import { accentVar, useInterval } from "../lib";
import { Calendar, iso, isoWeek, type CalendarEvent } from "./calendar";
import { Panel } from "./panel";
import { PanelSection } from "./panel-section";

export interface ClockPanelProps {
  /** Fixed "now" for screenshots. Omit for a live ticking clock. */
  now?: Date;
  events?: CalendarEvent[];
  /** Extra zones shown under the time, e.g. [["Berlin", "Europe/Berlin"]]. */
  zones?: [string, string][];
  className?: string;
}

/** Clock popup: huge time with seconds, world clocks, month calendar and agenda. */
export function ClockPanel({
  now,
  events,
  zones = [
    ["London", "Europe/London"],
    ["New York", "America/New_York"],
    ["Tokyo", "Asia/Tokyo"],
  ],
  className,
}: ClockPanelProps) {
  const [t, setT] = useState(() => now ?? new Date());
  useInterval(() => setT(new Date()), now ? null : 1000);
  const evs = events ?? demoEvents(t);
  const upcoming = evs.filter((e) => e.date >= iso(t)).slice(0, 3);
  return (
    <Panel
      data-component="ClockPanel"
      className={className}
      width={400}
      accent="mauve"
      title={t.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
      subtitle={`IST · UTC+05:30 · week ${isoWeek(t)}`}
      icon="clock"
    >
      <PanelSection>
        <BigTime t={t} />
        <WorldClocks t={t} zones={zones} />
      </PanelSection>
      <PanelSection>
        <Calendar today={t} events={evs} />
      </PanelSection>
      <PanelSection label="up next">
        <Agenda t={t} events={upcoming} />
      </PanelSection>
    </Panel>
  );
}

/** 12-hour time with small seconds and AM/PM. */
function BigTime({ t }: { t: Date }) {
  const hh = t.getHours() % 12 || 12;
  return (
    <div data-component="BigTime" className="flex items-start gap-1 text-[52px] leading-none font-bold tracking-[-.04em]">
      {String(hh).padStart(2, "0")}:{String(t.getMinutes()).padStart(2, "0")}
      <span className="mt-1 text-[22px] font-normal tracking-normal text-mauve">{String(t.getSeconds()).padStart(2, "0")}</span>
      <span className="mt-2 text-[12px] font-medium tracking-[.1em] text-overlay1">{t.getHours() < 12 ? "AM" : "PM"}</span>
    </div>
  );
}

function WorldClocks({ t, zones }: { t: Date; zones: [string, string][] }) {
  return (
    <div data-component="WorldClocks" className="flex flex-wrap gap-4 text-[11.5px]">
      {zones.map(([name, tz]) => (
        <span key={tz}>
          <span className="text-overlay1">{name}</span> {t.toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" })}
        </span>
      ))}
    </div>
  );
}

/** Upcoming events, each with an accent strip on the left. */
function Agenda({ t, events }: { t: Date; events: CalendarEvent[] }) {
  return (
    <div data-component="Agenda" className="flex flex-col gap-0.5">
      {events.length === 0 && <span className="text-overlay1">nothing scheduled</span>}
      {events.map((e) => (
        <div
          key={e.date + e.title}
          className="grid grid-cols-[58px_1fr_auto] gap-2.5 bg-base px-2.5 py-[7px] text-[12px] shadow-[inset_2px_0_0_var(--hx-acc)]"
          style={{ ["--hx-acc" as string]: accentVar(e.accent, "peach") }}
        >
          <span className="text-acc">
            {e.date === iso(t) ? "today" : new Date(e.date + "T00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
          </span>
          <span>{e.title}</span>
          <span className="text-overlay1">{e.time}</span>
        </div>
      ))}
    </div>
  );
}

function demoEvents(t: Date): CalendarEvent[] {
  const d = (n: number) => iso(new Date(t.getFullYear(), t.getMonth(), t.getDate() + n));
  return [
    { date: d(0), time: "18:30", title: "Gym — legs", accent: "green" },
    { date: d(2), time: "11:00", title: "Design review", accent: "mauve" },
    { date: d(5), time: "20:00", title: "Arch update night", accent: "sapphire" },
    { date: d(9), time: "all day", title: "Diwali break", accent: "peach" },
  ];
}
