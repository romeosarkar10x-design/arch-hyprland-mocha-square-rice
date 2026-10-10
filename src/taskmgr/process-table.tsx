import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { Icon, cx } from "../ui";
import { MACHINE, ME } from "./demo";
import { fmtCpu, fmtDuration, fmtKiB, fmtRate, STATE_LABEL, type MemMetric, type Proc, type Row, type SortKey } from "./procs";
import type { ColId, ProcView } from "./processes-page";
import { cmd, count, state, tag } from "./styles";

export const METRIC_HELP: Record<MemMetric, string> = {
  pss: "PSS: private memory plus a fair share of pages shared with other processes. Sums add up correctly — best for clubbing children.",
  uss: "USS: only this process's private pages — what you'd get back by ending it.",
  rss: "RSS: everything resident, shared libraries counted in full for every process. Summing RSS over-counts.",
};

export interface Col {
  id: ColId;
  label: string;
  title?: string;
  sort?: SortKey;
  width: number | string;
  right?: boolean;
  cell: (r: Row, p: Proc | undefined) => ReactNode;
  heat?: (r: Row) => number;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function columns(v: ProcView, uptime: number): Col[] {
  const cpu = (r: Row) => (v.cpuScale === "total" ? r.shown.cpu / MACHINE.threads : r.shown.cpu);
  return [
    { id: "pid", label: "PID", sort: "pid", width: 64, right: true, cell: (_, p) => p?.pid },
    { id: "ppid", label: "PPID", width: 64, right: true, cell: (_, p) => p?.ppid },
    {
      id: "user",
      label: "User",
      sort: "user",
      width: 96,
      cell: (_, p) => p && <span className={p.user === ME ? undefined : p.user === "root" ? "text-red" : "text-overlay1"}>{p.user}</span>,
    },
    {
      id: "state",
      label: "S",
      title: "State: R running, S sleeping, D disk wait, T stopped, Z zombie, I idle",
      sort: "state",
      width: 34,
      cell: (_, p) =>
        p && (
          <span className={state(p.state)} title={STATE_LABEL[p.state]}>
            {p.state}
          </span>
        ),
    },
    {
      id: "cpu",
      label: "CPU",
      title: v.cpuScale === "total" ? "% of all 16 threads" : "% of one core (htop / Irix mode)",
      sort: "cpu",
      width: 72,
      right: true,
      cell: (r) => `${fmtCpu(cpu(r))}%`,
      heat: (r) => clamp01(r.shown.cpu / MACHINE.threads / 25),
    },
    {
      id: "mem",
      label: v.metric.toUpperCase(),
      title: METRIC_HELP[v.metric],
      sort: "mem",
      width: 92,
      right: true,
      cell: (r) => fmtKiB(r.shown.mem),
      heat: (r) => clamp01((r.shown.mem / MACHINE.memTotal) * 10),
    },
    {
      id: "shared",
      label: "Shared",
      title: "Resident shared pages (libraries, shmem)",
      width: 84,
      right: true,
      cell: (r) => fmtKiB(r.shown.rss - r.shown.uss),
    },
    { id: "swap", label: "Swap", sort: "swap", width: 72, right: true, cell: (r) => (r.shown.swap ? fmtKiB(r.shown.swap) : "—") },
    { id: "vsz", label: "Virtual", sort: "vsz", width: 84, right: true, cell: (r) => fmtKiB(r.shown.vsz) },
    { id: "threads", label: "Thr", title: "Threads", sort: "threads", width: 50, right: true, cell: (r) => r.shown.threads },
    {
      id: "disk",
      label: "Disk",
      title: "Read + write",
      sort: "disk",
      width: 84,
      right: true,
      cell: (r) => fmtRate(r.shown.read + r.shown.write),
      heat: (r) => clamp01((r.shown.read + r.shown.write) / (8 * 1024 * 1024)),
    },
    {
      id: "nice",
      label: "NI",
      title: "Nice: -20 highest priority … 19 lowest",
      sort: "nice",
      width: 40,
      right: true,
      cell: (_, p) => p && <span className={p.nice < 0 ? "font-bold text-red" : p.nice > 0 ? "text-sky" : undefined}>{p.nice}</span>,
    },
    { id: "start", label: "Started", sort: "start", width: 72, right: true, cell: (_, p) => p && `${fmtDuration(uptime - p.start)} ago` },
    { id: "time", label: "CPU time", sort: "time", width: 76, right: true, cell: (_, p) => p && fmtDuration(p.cputime) },
    { id: "tty", label: "TTY", width: 56, cell: (_, p) => p?.tty ?? "?" },
    { id: "unit", label: "Unit / cgroup", width: 200, cell: (_, p) => p && <span className="text-overlay1">{p.unit}</span> },
    {
      id: "cmd",
      label: "Command",
      width: "minmax(220px, 1fr)",
      cell: (_, p) => p && <span className={cmd}>{p.state === "Z" ? `[${p.name}] <defunct>` : p.cmd}</span>,
    },
  ];
}

/** Grid row shared by the header and every process row; columns come from --rx-tm-grid. */
const gridRow = "grid min-w-max grid-cols-(--rx-tm-grid)";

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <div data-component="TableHead" className={cx(gridRow, "sticky top-0 z-2 border-b border-surface0 bg-base")} role="row">
      {children}
    </div>
  );
}

export function HeadCell({
  label,
  title,
  right,
  active,
  desc,
  onClick,
  top,
}: {
  label: string;
  title?: string;
  right?: boolean;
  active: boolean;
  desc: boolean;
  onClick?: () => void;
  top?: string;
}) {
  return (
    <button
      type="button"
      role="columnheader"
      aria-sort={active ? (desc ? "descending" : "ascending") : undefined}
      data-component="HeadCell"
      className={cx(
        "unbutton flex min-h-[42px] cursor-pointer flex-col justify-end gap-px border-l border-surface0 px-2 py-1 text-left first:border-l-0",
        right && "items-end text-right",
        active && "text-mauve shadow-[inset_0_-2px_0_var(--hx-mauve)]",
        onClick ? "hover:bg-surface0 hover:text-text" : "cursor-default",
      )}
      onClick={onClick}
      title={title}
      tabIndex={-1}
    >
      {top && <b className="text-[15px] font-bold text-text">{top}</b>}
      <span className="inline-flex items-center gap-1">
        {label}
        {active && <Icon name={desc ? "down" : "up"} size={11} />}
      </span>
    </button>
  );
}

// Tree guides: one 14px column per ancestor level; `│` for a continuing line, `├` / `└` at the row itself.
const guide = "relative w-3.5 flex-none self-stretch";
const guideLine = "before:absolute before:inset-y-0 before:left-1.5 before:border-l before:border-surface2";

/** Stable ref: React calls it only when a row becomes the selected one, so ticks don't fight the user's scrolling. */
const scrollIntoView = (el: HTMLDivElement | null) => el?.scrollIntoView({ block: "nearest" });

export function ProcRow({
  r,
  v,
  cols,
  selected,
  tagged,
  onSelect,
  onToggle,
  onMenu,
  onOpen,
}: {
  r: Row;
  v: ProcView;
  cols: Col[];
  selected: boolean;
  tagged: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onMenu: (e: MouseEvent) => void;
  onOpen: () => void;
}) {
  const p = r.proc;
  const badge =
    r.kind === "group" ? (r.count > 1 ? `(${r.count})` : "") : v.club && r.count > 1 ? `Σ ${r.count}` : !r.expanded && r.hasChildren ? `+${r.count - 1}` : "";
  return (
    <div
      ref={selected ? scrollIntoView : undefined}
      role="row"
      aria-selected={selected}
      aria-expanded={r.hasChildren ? r.expanded : undefined}
      aria-level={r.depth + 1}
      data-component="ProcRow"
      className={cx(
        gridRow,
        "h-6 cursor-default items-stretch hover:bg-surface0/55",
        selected && "bg-surface0 shadow-[inset_2px_0_0_var(--hx-mauve)] group-focus/table:bg-[color-mix(in_srgb,var(--hx-mauve)_18%,var(--hx-surface0))]",
        !r.match && "opacity-45",
      )}
      onMouseDown={onSelect}
      onDoubleClick={() => (r.hasChildren ? onToggle() : onOpen())}
      onContextMenu={onMenu}
    >
      <div
        className={cx("flex min-w-0 items-center gap-1 overflow-hidden pr-2 pl-1 whitespace-nowrap", tagged && "shadow-[inset_3px_0_0_var(--hx-yellow)]")}
        role="gridcell"
      >
        {v.mode === "tree" && r.guides.map((line, i) => <i key={i} className={cx(guide, line && guideLine)} />)}
        {r.depth > 0 && (
          <i
            className={cx(
              guide,
              guideLine,
              "after:absolute after:top-1/2 after:right-0 after:left-1.5 after:border-t after:border-surface2",
              r.last && "before:bottom-1/2",
            )}
          />
        )}
        <button
          type="button"
          tabIndex={-1}
          className="unbutton grid size-4 flex-none cursor-pointer place-items-center"
          style={{ visibility: r.hasChildren ? undefined : "hidden" }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onToggle}
          aria-label={r.expanded ? "Collapse" : "Expand"}
        >
          <Icon name={r.expanded ? "down" : "chevronRight"} size={11} />
        </button>
        <Icon name={r.icon ?? (p?.kernel ? "cpu" : p?.user === "root" ? "settings" : "terminal")} size={14} className="flex-none text-overlay1" />
        <span
          className={cx(
            "truncate",
            r.kind === "group" && "font-bold",
            tagged && "text-yellow",
            p?.state === "Z" && "text-red line-through",
            p?.state === "T" && "text-yellow",
          )}
        >
          {r.label}
        </span>
        {p?.state === "Z" && <span className={tag("red")}>defunct</span>}
        {p?.state === "T" && <span className={tag("yellow")}>stopped</span>}
        {badge && (
          <span className={count} title={v.club ? "Includes child processes" : undefined}>
            {badge}
          </span>
        )}
      </div>
      {cols.map((c) => {
        const h = c.heat?.(r) ?? 0;
        return (
          <div
            key={c.id}
            role="gridcell"
            className={cx(
              "flex min-w-0 items-center overflow-hidden border-l border-surface0/60 px-2 whitespace-nowrap text-subtext0",
              c.right && "justify-end",
              h > 0.02 && "bg-[color-mix(in_srgb,var(--hx-peach)_calc(var(--h)*42%),transparent)] text-text",
              tagged && "text-yellow",
            )}
            style={h > 0.02 ? ({ "--h": h.toFixed(2) } as CSSProperties) : undefined}
          >
            {c.cell(r, p)}
          </div>
        );
      })}
    </div>
  );
}
