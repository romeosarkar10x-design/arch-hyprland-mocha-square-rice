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
  const hh = t.getHours() % 12 || 12;
  return (
    <Panel
      className={className}
      width={400}
      accent="mauve"
      title={t.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
      subtitle={`IST · UTC+05:30 · week ${isoWeek(t)}`}
      icon="clock"
    >
      <PanelSection>
        <div className="hx-bigtime">
          {String(hh).padStart(2, "0")}:{String(t.getMinutes()).padStart(2, "0")}
          <span className="hx-bigtime-s">{String(t.getSeconds()).padStart(2, "0")}</span>
          <span className="hx-bigtime-ap">{t.getHours() < 12 ? "AM" : "PM"}</span>
        </div>
        <div className="hx-zones">
          {zones.map(([name, tz]) => (
            <span key={tz}>
              <span className="hx-faint">{name}</span> {t.toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" })}
            </span>
          ))}
        </div>
      </PanelSection>
      <PanelSection>
        <Calendar today={t} events={evs} />
      </PanelSection>
      <PanelSection label="up next">
        <div className="hx-agenda">
          {upcoming.length === 0 && <span className="hx-faint">nothing scheduled</span>}
          {upcoming.map((e) => (
            <div key={e.date + e.title} className="hx-agenda-row" style={{ ["--hx-acc" as string]: accentVar(e.accent, "peach") }}>
              <span className="hx-agenda-when">
                {e.date === iso(t) ? "today" : new Date(e.date + "T00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
              </span>
              <span className="hx-agenda-title">{e.title}</span>
              <span className="hx-faint">{e.time}</span>
            </div>
          ))}
        </div>
      </PanelSection>
    </Panel>
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
