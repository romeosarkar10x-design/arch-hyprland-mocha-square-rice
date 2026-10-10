import { Fragment, useState } from "react";
import { IconButton } from "../controls/icon-button";
import { accentVar, cx, type Accent } from "../lib";

const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export interface CalendarEvent {
  /** Local date, YYYY-MM-DD. */
  date: string;
  title: string;
  /** Shown in the agenda, e.g. "18:30" or "all day". */
  time?: string;
  accent?: Accent;
}

export interface CalendarProps {
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

/** Monday-first month grid with ISO weeks, event dots and month paging. Today is a solid mauve square. */
export function Calendar({ today = new Date(), month, events = [], weekNumbers = true, onSelect, className }: CalendarProps) {
  const [view, setView] = useState(() => new Date((month ?? today).getFullYear(), (month ?? today).getMonth(), 1));
  const [sel, setSel] = useState(iso(today));
  return (
    <div data-component="Calendar" className={cx("kit-type flex flex-col gap-2 text-text", className)}>
      <CalendarHeader
        view={view}
        onPage={(by) => setView(new Date(view.getFullYear(), view.getMonth() + by, 1))}
        onToday={() => {
          setView(new Date(today.getFullYear(), today.getMonth(), 1));
          setSel(iso(today));
        }}
      />
      <CalendarGrid
        view={view}
        today={today}
        selected={sel}
        events={events}
        weekNumbers={weekNumbers}
        onSelect={(d) => {
          setSel(iso(d));
          onSelect?.(d);
        }}
      />
    </div>
  );
}

function CalendarHeader({ view, onPage, onToday }: { view: Date; onPage: (by: number) => void; onToday: () => void }) {
  return (
    <div data-component="CalendarHeader" className="flex items-center justify-between">
      <span className="text-[13px] font-bold">
        {MONTHS[view.getMonth()]} <span className="text-overlay1">{view.getFullYear()}</span>
      </span>
      <span className="flex items-center gap-0.5">
        <IconButton icon="chevronLeft" label="Previous month" size="sm" onClick={() => onPage(-1)} />
        <button
          type="button"
          className="unbutton h-[26px] cursor-pointer bg-transparent px-2 font-hx text-[11px] text-subtext0 hover:bg-surface0 hover:text-text"
          onClick={onToday}
        >
          today
        </button>
        <IconButton icon="chevronRight" label="Next month" size="sm" onClick={() => onPage(1)} />
      </span>
    </div>
  );
}

interface CalendarGridProps {
  view: Date;
  today: Date;
  selected: string;
  events: CalendarEvent[];
  weekNumbers: boolean;
  onSelect: (d: Date) => void;
}

const headCell = "grid h-[22px] place-items-center text-[9.5px] tracking-[.12em] text-overlay1 uppercase";

function CalendarGrid({ view, today, selected, events, weekNumbers, onSelect }: CalendarGridProps) {
  const lead = (view.getDay() + 6) % 7;
  const start = new Date(view.getFullYear(), view.getMonth(), 1 - lead);
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const evDays = new Map(events.map((e) => [e.date, e]));
  return (
    <div data-component="CalendarGrid" className={cx("grid gap-0.5 text-[12px]", weekNumbers ? "grid-cols-[26px_repeat(7,1fr)]" : "grid-cols-7")}>
      {weekNumbers && <span className={headCell}>wk</span>}
      {DOW.map((d) => (
        <span key={d} className={headCell}>
          {d}
        </span>
      ))}
      {days.map((d, i) => {
        const key = iso(d);
        const ev = evDays.get(key);
        const isToday = key === iso(today);
        return (
          <Fragment key={key}>
            {weekNumbers && i % 7 === 0 && <span className="grid place-items-center text-[10px] text-surface2">{isoWeek(d)}</span>}
            <button
              type="button"
              className={cx(
                "unbutton relative grid h-8 cursor-pointer place-items-center bg-transparent text-text transition-[background-color] hover:bg-surface0",
                i % 7 >= 5 && "text-subtext0",
                d.getMonth() !== view.getMonth() && "text-surface2",
                key === selected && "inset-ring inset-ring-mauve",
                isToday && "bg-mauve font-bold text-crust hover:bg-mauve",
              )}
              onClick={() => onSelect(d)}
            >
              {d.getDate()}
              {ev && (
                <i
                  className={cx("absolute bottom-1 left-1/2 -ml-0.5 size-1", isToday && "bg-crust!")}
                  style={{ background: accentVar(ev.accent, "peach") }}
                />
              )}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}

export function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - y0.getTime()) / 864e5 + 1) / 7);
}
