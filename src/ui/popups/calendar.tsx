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
  const first = view;
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - lead);
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const evDays = new Map(events.map((e) => [e.date, e]));
  return (
    <div className={cx("hx-cal", className)}>
      <div className="hx-cal-head">
        <span className="hx-cal-month">
          {MONTHS[view.getMonth()]} <span className="hx-faint">{view.getFullYear()}</span>
        </span>
        <span className="hx-cal-nav">
          <IconButton
            icon="chevronLeft"
            label="Previous month"
            size="sm"
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          />
          <button
            type="button"
            className="hx-cal-today"
            onClick={() => {
              setView(new Date(today.getFullYear(), today.getMonth(), 1));
              setSel(iso(today));
            }}
          >
            today
          </button>
          <IconButton
            icon="chevronRight"
            label="Next month"
            size="sm"
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          />
        </span>
      </div>
      <div className={cx("hx-cal-grid", weekNumbers && "has-weeks")}>
        {weekNumbers && <span className="hx-cal-h">wk</span>}
        {DOW.map((d) => (
          <span key={d} className="hx-cal-h">
            {d}
          </span>
        ))}
        {days.map((d, i) => {
          const key = iso(d);
          const ev = evDays.get(key);
          return (
            <Fragment key={key}>
              {weekNumbers && i % 7 === 0 && <span className="hx-cal-wk">{isoWeek(d)}</span>}
              <button
                type="button"
                className={cx(
                  "hx-cal-d",
                  d.getMonth() !== view.getMonth() && "is-out",
                  i % 7 >= 5 && "is-weekend",
                  key === iso(today) && "is-today",
                  key === sel && "is-selected",
                )}
                onClick={() => {
                  setSel(key);
                  onSelect?.(d);
                }}
              >
                {d.getDate()}
                {ev && <i className="hx-cal-dot" style={{ background: accentVar(ev.accent, "peach") }} />}
              </button>
            </Fragment>
          );
        })}
      </div>
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
