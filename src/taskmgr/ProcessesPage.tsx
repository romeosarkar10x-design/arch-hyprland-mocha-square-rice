import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Button, Icon } from "../ds";
import type { Ask } from "./dialogs";
import { MACHINE, ME } from "./demo";
import { ProcessDetails } from "./ProcessDetails";
import {
  buildRows,
  fmtCpu,
  fmtDuration,
  fmtKiB,
  fmtRate,
  STATE_LABEL,
  summarise,
  type GroupBy,
  type MemMetric,
  type Proc,
  type Row,
  type SortKey,
  type ViewMode,
} from "./procs";
import type { Action, TM } from "./store";

export type ColId = "pid" | "ppid" | "user" | "state" | "cpu" | "mem" | "shared" | "swap" | "vsz" | "threads" | "disk" | "nice" | "start" | "time" | "tty" | "unit" | "cmd";

export interface ProcView {
  mode: ViewMode;
  groupBy: GroupBy;
  club: boolean;
  metric: MemMetric;
  cpuScale: "total" | "core";
  hideKernel: boolean;
  onlyMine: boolean;
  sort: SortKey;
  desc: boolean;
  query: string;
  columns: ColId[];
}

export const DEFAULT_VIEW: ProcView = {
  mode: "tree",
  groupBy: "app",
  club: true,
  metric: "pss",
  cpuScale: "total",
  hideKernel: true,
  onlyMine: false,
  sort: "pid",
  desc: false,
  query: "",
  columns: ["pid", "user", "state", "cpu", "mem", "threads", "disk", "nice", "cmd"],
};

const METRIC_HELP: Record<MemMetric, string> = {
  pss: "PSS: private memory plus a fair share of pages shared with other processes. Sums add up correctly — best for clubbing children.",
  uss: "USS: only this process's private pages — what you'd get back by ending it.",
  rss: "RSS: everything resident, shared libraries counted in full for every process. Summing RSS over-counts.",
};

interface Col {
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

function columns(v: ProcView, uptime: number): Col[] {
  const cpu = (r: Row) => (v.cpuScale === "total" ? r.shown.cpu / MACHINE.threads : r.shown.cpu);
  return [
    { id: "pid", label: "PID", sort: "pid", width: 64, right: true, cell: (_, p) => p?.pid },
    { id: "ppid", label: "PPID", width: 64, right: true, cell: (_, p) => p?.ppid },
    { id: "user", label: "User", sort: "user", width: 96, cell: (_, p) => p && <span className={p.user === ME ? undefined : p.user === "root" ? "rx-tm-root" : "hx-faint"}>{p.user}</span> },
    {
      id: "state",
      label: "S",
      title: "State: R running, S sleeping, D disk wait, T stopped, Z zombie, I idle",
      sort: "state",
      width: 34,
      cell: (_, p) => p && <span className={`rx-tm-state rx-tm-state--${p.state}`} title={STATE_LABEL[p.state]}>{p.state}</span>,
    },
    { id: "cpu", label: "CPU", title: v.cpuScale === "total" ? "% of all 16 threads" : "% of one core (htop / Irix mode)", sort: "cpu", width: 72, right: true, cell: (r) => `${fmtCpu(cpu(r))}%`, heat: (r) => clamp01((r.shown.cpu / MACHINE.threads) / 25) },
    { id: "mem", label: v.metric.toUpperCase(), title: METRIC_HELP[v.metric], sort: "mem", width: 92, right: true, cell: (r) => fmtKiB(r.shown.mem), heat: (r) => clamp01((r.shown.mem / MACHINE.memTotal) * 10) },
    { id: "shared", label: "Shared", title: "Resident shared pages (libraries, shmem)", width: 84, right: true, cell: (r) => fmtKiB(r.shown.rss - r.shown.uss) },
    { id: "swap", label: "Swap", sort: "swap", width: 72, right: true, cell: (r) => (r.shown.swap ? fmtKiB(r.shown.swap) : "—") },
    { id: "vsz", label: "Virtual", sort: "vsz", width: 84, right: true, cell: (r) => fmtKiB(r.shown.vsz) },
    { id: "threads", label: "Thr", title: "Threads", sort: "threads", width: 50, right: true, cell: (r) => r.shown.threads },
    { id: "disk", label: "Disk", title: "Read + write", sort: "disk", width: 84, right: true, cell: (r) => fmtRate(r.shown.read + r.shown.write), heat: (r) => clamp01((r.shown.read + r.shown.write) / (8 * 1024 * 1024)) },
    { id: "nice", label: "NI", title: "Nice: -20 highest priority … 19 lowest", sort: "nice", width: 40, right: true, cell: (_, p) => p && <span className={p.nice < 0 ? "rx-tm-hi" : p.nice > 0 ? "rx-tm-lo" : undefined}>{p.nice}</span> },
    { id: "start", label: "Started", sort: "start", width: 72, right: true, cell: (_, p) => p && `${fmtDuration(uptime - p.start)} ago` },
    { id: "time", label: "CPU time", sort: "time", width: 76, right: true, cell: (_, p) => p && fmtDuration(p.cputime) },
    { id: "tty", label: "TTY", width: 56, cell: (_, p) => p?.tty ?? "?" },
    { id: "unit", label: "Unit / cgroup", width: 200, cell: (_, p) => p && <span className="hx-faint">{p.unit}</span> },
    { id: "cmd", label: "Command", width: "minmax(220px, 1fr)", cell: (_, p) => p && <span className="rx-tm-cmd">{p.state === "Z" ? `[${p.name}] <defunct>` : p.cmd}</span> },
  ];
}

const ALL_COLS: ColId[] = ["pid", "ppid", "user", "state", "cpu", "mem", "shared", "swap", "vsz", "threads", "disk", "nice", "start", "time", "tty", "unit", "cmd"];

export interface ProcessesPageProps {
  tm: TM;
  dispatch: (a: Action) => void;
  ask: Ask;
  view?: Partial<ProcView>;
  /** Selected process. A new value (e.g. from "go to process") reselects. */
  focus?: { pid: number; n: number };
  details?: boolean;
}

export function ProcessesPage({ tm, dispatch, ask, view: initialView, focus, details: initialDetails = false }: ProcessesPageProps) {
  const [v, setV] = useState<ProcView>({ ...DEFAULT_VIEW, ...initialView });
  const [toggled, setToggled] = useState<ReadonlySet<string>>(new Set());
  const [sel, setSel] = useState<string>(focus ? `p:${focus.pid}` : "p:2200");
  const [prevFocus, setPrevFocus] = useState(focus);
  const [tagged, setTagged] = useState<ReadonlySet<number>>(new Set());
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [colsOpen, setColsOpen] = useState(false);
  const [details, setDetails] = useState(initialDetails);
  const searchRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<ProcView>) => setV((x) => ({ ...x, ...patch }));
  const rows = useMemo(
    () => buildRows(tm.procs, { ...v, onlyUser: v.onlyMine ? ME : undefined, toggled }),
    [tm.procs, v, toggled],
  );

  // Jump to a process from another page: make sure it's visible, then select it.
  if (focus && focus !== prevFocus) {
    setPrevFocus(focus);
    setSel(`p:${focus.pid}`);
    setV((x) => ({ ...x, query: "", mode: x.mode === "group" ? "tree" : x.mode, hideKernel: x.hideKernel && !tm.procs.find((p) => p.pid === focus.pid)?.kernel }));
    setToggled(new Set());
  }

  const index = Math.max(0, rows.findIndex((r) => r.key === sel || r.key.endsWith(`/${sel}`)));
  const row: Row | undefined = rows[index];
  const proc = row?.proc;
  const targets = tagged.size ? [...tagged].filter((pid) => tm.procs.some((p) => p.pid === pid)) : (row?.pids ?? []);
  const cols = columns(v, tm.uptime).filter((c) => v.columns.includes(c.id));
  const sum = summarise(tm.procs, MACHINE, tm.load);
  const grid = `minmax(260px, 2fr) ${cols.map((c) => (typeof c.width === "number" ? `${c.width}px` : c.width)).join(" ")}`;

  const go = (i: number) => {
    const r = rows[Math.max(0, Math.min(rows.length - 1, i))];
    if (r) setSel(r.key);
  };
  const flip = (key: string) =>
    setToggled((t) => {
      const n = new Set(t);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  const setExpanded = (r: Row, open: boolean) => r.hasChildren && r.expanded !== open && flip(r.key.split("/")[0]!);
  const tag = (pids: number[]) =>
    setTagged((t) => {
      const n = new Set(t);
      const on = pids.some((p) => !n.has(p));
      for (const p of pids) if (on) n.add(p); else n.delete(p);
      return n;
    });
  const parentKey = (r: Row) => (r.key.includes("/") ? r.key.split("/")[0]! : r.proc && rows.some((x) => x.key === `p:${r.proc!.ppid}`) ? `p:${r.proc.ppid}` : undefined);
  const openMenu = (e: MouseEvent | { clientX: number; clientY: number }) => {
    const box = rootRef.current!.getBoundingClientRect();
    // Keep the ~240×400 menu inside the window.
    setMenu({ x: Math.max(0, Math.min(e.clientX - box.left, box.width - 240)), y: Math.max(0, Math.min(e.clientY - box.top, box.height - 400)) });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    const k = e.key;
    if (menu) {
      if (k === "Escape") setMenu(null);
      return;
    }
    if (k === "ArrowDown") go(index + 1);
    else if (k === "ArrowUp") go(index - 1);
    else if (k === "PageDown") go(index + 15);
    else if (k === "PageUp") go(index - 15);
    else if (k === "Home") go(0);
    else if (k === "End") go(rows.length - 1);
    else if (k === "ArrowRight" && row) {
      if (row.hasChildren && !row.expanded) setExpanded(row, true);
      else go(index + 1);
    }
    else if (k === "ArrowLeft" && row) {
      if (row.expanded) setExpanded(row, false);
      else {
        const pk = parentKey(row);
        if (pk) setSel(pk);
      }
    } else if (k === " " && row) {
      tag(row.pids);
      go(index + 1);
    } else if (k === "u") setTagged(new Set());
    else if (k === "Delete") ask.send(targets, e.shiftKey ? 9 : 15);
    else if (k === "k" || k === "F9") ask.signal(targets);
    else if ((k === "n" || k === "F7" || k === "F8") && proc) ask.renice(proc.pid);
    else if ((k === "]" || k === "[") && proc) dispatch({ type: "renice", pid: proc.pid, nice: proc.nice + (k === "]" ? 1 : -1) });
    else if (k === "Enter") setDetails((d) => !d);
    else if (k === "/" || (k === "f" && e.ctrlKey)) searchRef.current?.focus();
    else if (k === "t" || k === "F5") set({ mode: v.mode === "tree" ? "list" : "tree" });
    else if (k === "g") set({ mode: "group" });
    else if (k === "c") set({ club: !v.club });
    else if (k === "K") set({ hideKernel: !v.hideKernel });
    else if (k === "+" && row) setExpanded(row, true);
    else if (k === "-" && row) setExpanded(row, false);
    else if (k === "*") setToggled(new Set());
    else if (k === "p" && proc) {
      const pk = parentKey(row!);
      if (pk) setSel(pk);
    } else if (k === "ContextMenu" || (k === "F10" && e.shiftKey)) {
      const el = tableRef.current?.querySelector(".rx-tm-row.is-sel")?.getBoundingClientRect();
      if (el) openMenu({ clientX: el.left + 120, clientY: el.bottom });
    } else if (k === "Escape") {
      if (tagged.size) setTagged(new Set());
      else if (v.query) set({ query: "" });
      else setDetails(false);
    } else return;
    e.preventDefault();
  };

  const sortBy = (key?: SortKey) => key && set(v.sort === key ? { desc: !v.desc } : { sort: key, desc: !["name", "user", "pid", "state", "start"].includes(key) });

  return (
    <div className="rx-tm-procs" ref={rootRef} onKeyDown={onKeyDown} onClick={() => (setMenu(null), setColsOpen(false))}>
      <div className="rx-tm-toolbar">
        <label className="rx-tm-search">
          <Icon name="search" size={14} />
          <input ref={searchRef} value={v.query} placeholder="Name, PID, user, command…  ( / )" onChange={(e) => set({ query: e.target.value })} onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") {
              if (e.key === "Escape") set({ query: "" });
              tableRef.current?.focus();
            }
          }} />
        </label>
        <div className="rx-tm-seg" role="radiogroup" aria-label="View">
          {(["tree", "list", "group"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={v.mode === m} className={v.mode === m ? "is-active" : undefined} onClick={() => set({ mode: m })} title={m === "tree" ? "Process tree (t / F5)" : m === "list" ? "Flat list (t)" : "Grouped (g)"}>
              {m === "tree" ? "Tree" : m === "list" ? "List" : "Grouped"}
            </button>
          ))}
        </div>
        {v.mode === "group" && (
          <select className="rx-tm-select" value={v.groupBy} onChange={(e) => set({ groupBy: e.target.value as GroupBy })} aria-label="Group by">
            <option value="app">by app</option>
            <option value="name">by name</option>
            <option value="user">by user</option>
            <option value="unit">by systemd unit</option>
          </select>
        )}
        <Chip on={v.club} disabled={v.mode === "group"} onClick={() => set({ club: !v.club })} title="Club children: each row shows itself plus all its descendants (c)">
          Σ Club children
        </Chip>
        <Chip on={!v.hideKernel} onClick={() => set({ hideKernel: !v.hideKernel })} title="Show kernel threads (K)">
          Kernel threads
        </Chip>
        <Chip on={v.onlyMine} onClick={() => set({ onlyMine: !v.onlyMine })} title={`Only ${ME}'s processes`}>
          Only mine
        </Chip>
        <select className="rx-tm-select" value={v.metric} onChange={(e) => set({ metric: e.target.value as MemMetric })} title={METRIC_HELP[v.metric]} aria-label="Memory metric">
          <option value="pss">Memory: PSS</option>
          <option value="uss">Memory: USS</option>
          <option value="rss">Memory: RSS</option>
        </select>
        <select className="rx-tm-select" value={v.cpuScale} onChange={(e) => set({ cpuScale: e.target.value as ProcView["cpuScale"] })} aria-label="CPU scale">
          <option value="total">CPU: % of total</option>
          <option value="core">CPU: % of a core</option>
        </select>
        <span className="hx-spacer" />
        <div className="rx-tm-colpick" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" icon="settings" onClick={() => setColsOpen((o) => !o)}>
            Columns
          </Button>
          {colsOpen && (
            <div className="rx-tm-menu rx-tm-colmenu">
              {ALL_COLS.map((id) => (
                <label key={id} className="rx-tm-check">
                  <input type="checkbox" checked={v.columns.includes(id)} onChange={() => set({ columns: v.columns.includes(id) ? v.columns.filter((c) => c !== id) : ALL_COLS.filter((c) => c === id || v.columns.includes(c)) })} />
                  {columns(v, tm.uptime).find((c) => c.id === id)!.label} <span className="hx-faint">{columns(v, tm.uptime).find((c) => c.id === id)!.title?.split(":")[0]}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <Button size="sm" variant="ghost" icon="info" onClick={() => setDetails((d) => !d)} kbd="⏎">
          Properties
        </Button>
        <Button size="sm" variant="secondary" icon="flash" disabled={!targets.length} onClick={() => ask.signal(targets)} kbd="K">
          Signal
        </Button>
        <Button size="sm" variant="danger" icon="close" disabled={!targets.length} onClick={() => ask.send(targets, 15)} kbd="DEL">
          End task{targets.length > 1 ? ` (${targets.length})` : ""}
        </Button>
      </div>

      <div className={["rx-tm-split", details && proc && "has-details"].filter(Boolean).join(" ")}>
        <div className="rx-tm-table" ref={tableRef} tabIndex={0} role="treegrid" aria-label="Processes" style={{ "--rx-tm-grid": grid } as CSSProperties}>
          <div className="rx-tm-head" role="row">
            <HeadCell label="Name" active={v.sort === "name"} desc={v.desc} onClick={() => sortBy("name")} top={`${sum.tasks} tasks`} />
            {cols.map((c) => (
              <HeadCell
                key={c.id}
                label={c.label}
                title={c.title}
                right={c.right}
                active={!!c.sort && v.sort === c.sort}
                desc={v.desc}
                onClick={c.sort ? () => sortBy(c.sort) : undefined}
                top={c.id === "cpu" ? `${Math.round(sum.cpu)}%` : c.id === "mem" ? `${Math.round((sum.memUsed / MACHINE.memTotal) * 100)}%` : c.id === "disk" ? fmtRate(sum.read + sum.write) : undefined}
              />
            ))}
          </div>
          {rows.map((r) => (
            <ProcRow
              key={r.key}
              r={r}
              v={v}
              cols={cols}
              selected={r === row}
              tagged={r.pids.length > 0 && r.pids.every((p) => tagged.has(p))}
              onSelect={() => setSel(r.key)}
              onToggle={() => flip(r.key.split("/")[0]!)}
              onMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSel(r.key);
                openMenu(e);
              }}
              onOpen={() => setDetails(true)}
            />
          ))}
          {rows.length === 0 && (
            <div className="rx-tm-empty">
              <Icon name="search" size={28} />
              <b>No processes match “{v.query}”</b>
              <span className="hx-faint">{v.hideKernel && "Kernel threads are hidden. "}Esc clears the search.</span>
            </div>
          )}
        </div>
        {details && proc && (
          <ProcessDetails
            key={proc.pid}
            proc={proc}
            tm={tm}
            metric={v.metric}
            ask={ask}
            onSelect={(pid) => {
              setSel(`p:${pid}`);
              if (v.mode === "group") set({ mode: "tree" });
            }}
            onClose={() => setDetails(false)}
          />
        )}
      </div>

      <footer className="rx-tm-hints hx-faint">
        {tagged.size > 0 && (
          <span className="rx-tm-tagged">
            {tagged.size} tagged · actions apply to tagged <button type="button" onClick={() => setTagged(new Set())}>clear (u)</button>
          </span>
        )}
        <span>↑↓ move · ←→ fold · SPACE tag · DEL end · ⇧DEL kill · K signal · N / [ ] nice · ⏎ details · T tree · G group · C club · / search · ⇧F10 menu</span>
      </footer>

      {menu && row && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          row={row}
          targets={targets}
          tagged={tagged.size > 0}
          ask={ask}
          onClose={() => setMenu(null)}
          onToggle={row.hasChildren ? () => flip(row.key.split("/")[0]!) : undefined}
          onTag={() => tag(row.pids)}
          onParent={proc && parentKey(row) ? () => setSel(parentKey(row)!) : undefined}
          onDetails={() => setDetails(true)}
        />
      )}
    </div>
  );
}

function Chip({ on, disabled, onClick, title, children }: { on: boolean; disabled?: boolean; onClick: () => void; title?: string; children: ReactNode }) {
  return (
    <button type="button" className={["rx-tm-chip", on && "is-on"].filter(Boolean).join(" ")} aria-pressed={on} disabled={disabled} onClick={onClick} title={title}>
      <i />
      {children}
    </button>
  );
}

function HeadCell({ label, title, right, active, desc, onClick, top }: { label: string; title?: string; right?: boolean; active: boolean; desc: boolean; onClick?: () => void; top?: string }) {
  return (
    <button type="button" role="columnheader" aria-sort={active ? (desc ? "descending" : "ascending") : undefined} className={["rx-tm-th", right && "is-right", active && "is-sorted", !onClick && "is-static"].filter(Boolean).join(" ")} onClick={onClick} title={title} tabIndex={-1}>
      {top && <b>{top}</b>}
      <span>
        {label}
        {active && <Icon name={desc ? "down" : "up"} size={11} />}
      </span>
    </button>
  );
}

/** Stable ref: React calls it only when a row becomes the selected one, so ticks don't fight the user's scrolling. */
const scrollIntoView = (el: HTMLDivElement | null) => el?.scrollIntoView({ block: "nearest" });

function ProcRow({ r, v, cols, selected, tagged, onSelect, onToggle, onMenu, onOpen }: { r: Row; v: ProcView; cols: Col[]; selected: boolean; tagged: boolean; onSelect: () => void; onToggle: () => void; onMenu: (e: MouseEvent) => void; onOpen: () => void }) {
  const p = r.proc;
  const badge =
    r.kind === "group" ? (r.count > 1 ? `(${r.count})` : "")
    : v.club && r.count > 1 ? `Σ ${r.count}`
    : !r.expanded && r.hasChildren ? `+${r.count - 1}`
    : "";
  return (
    <div
      ref={selected ? scrollIntoView : undefined}
      role="row"
      aria-selected={selected}
      aria-expanded={r.hasChildren ? r.expanded : undefined}
      aria-level={r.depth + 1}
      className={["rx-tm-row", selected && "is-sel", tagged && "is-tagged", !r.match && "is-context", r.kind === "group" && "is-group", p && `is-${p.state}`].filter(Boolean).join(" ")}
      onMouseDown={onSelect}
      onDoubleClick={() => (r.hasChildren ? onToggle() : onOpen())}
      onContextMenu={onMenu}
    >
      <div className="rx-tm-name" role="gridcell">
        {v.mode === "tree" &&
          r.guides.map((line, i) => <i key={i} className={["rx-tm-guide", line && "is-line"].filter(Boolean).join(" ")} />)}
        {r.depth > 0 && <i className={["rx-tm-guide", "is-branch", r.last && "is-last"].filter(Boolean).join(" ")} />}
        <button
          type="button"
          tabIndex={-1}
          className="rx-tm-caret"
          style={{ visibility: r.hasChildren ? undefined : "hidden" }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onToggle}
          aria-label={r.expanded ? "Collapse" : "Expand"}
        >
          <Icon name={r.expanded ? "down" : "chevronRight"} size={11} />
        </button>
        <Icon name={r.icon ?? (p?.kernel ? "cpu" : p?.user === "root" ? "settings" : "terminal")} size={14} className="rx-tm-icon" />
        <span className="rx-tm-label">{r.label}</span>
        {p?.state === "Z" && <span className="rx-tm-tag rx-tm-tag--red">defunct</span>}
        {p?.state === "T" && <span className="rx-tm-tag rx-tm-tag--yellow">stopped</span>}
        {badge && <span className="rx-tm-count" title={v.club ? "Includes child processes" : undefined}>{badge}</span>}
      </div>
      {cols.map((c) => {
        const h = c.heat?.(r) ?? 0;
        return (
          <div key={c.id} role="gridcell" className={["rx-tm-cell", c.right && "is-right", h > 0.02 && "is-heat"].filter(Boolean).join(" ")} style={h > 0.02 ? ({ "--h": h.toFixed(2) } as CSSProperties) : undefined}>
            {c.cell(r, p)}
          </div>
        );
      })}
    </div>
  );
}

function ContextMenu({ x, y, row, targets, tagged, ask, onClose, onToggle, onTag, onParent, onDetails }: {
  x: number; y: number; row: Row; targets: number[]; tagged: boolean; ask: Ask; onClose: () => void;
  onToggle?: () => void; onTag: () => void; onParent?: () => void; onDetails: () => void;
}) {
  const p = row.proc;
  const n = targets.length;
  const what = tagged ? `${n} tagged` : n > 1 ? `${n} processes` : "";
  const item = (label: ReactNode, run: () => void, o: { kbd?: string; icon?: string; danger?: boolean; disabled?: boolean } = {}) => (
    <button type="button" role="menuitem" className={o.danger ? "is-danger" : undefined} disabled={o.disabled} onClick={() => (onClose(), run())}>
      <Icon name={o.icon ?? "minus"} size={13} />
      <span>{label}</span>
      {o.kbd && <kbd className="hx-kbd">{o.kbd}</kbd>}
    </button>
  );
  const stopped = p?.state === "T";
  const copy = (text: string) => void navigator.clipboard?.writeText(text);
  return (
    <div className="rx-tm-menu rx-tm-ctx" role="menu" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()}>
      <header>
        {row.label}
        {p && <span className="hx-faint"> · PID {p.pid}</span>}
        {what && <span className="hx-faint"> · {what}</span>}
      </header>
      {item("End task", () => ask.send(targets, 15), { kbd: "DEL", icon: "close", danger: true })}
      {item("Kill", () => ask.send(targets, 9), { kbd: "⇧DEL", icon: "flash", danger: true })}
      {item("Kill process tree", () => ask.send(targets, 9, true), { icon: "branch", danger: true, disabled: !row.hasChildren && !(p && row.count > 1) && row.kind !== "group" })}
      <hr />
      {stopped ? item("Resume (SIGCONT)", () => ask.send(targets, 18), { icon: "play" }) : item("Suspend (SIGSTOP)", () => ask.send(targets, 19), { icon: "pause" })}
      {item("Send signal…", () => ask.signal(targets), { kbd: "K", icon: "flash" })}
      {item("Change priority…", () => p && ask.renice(p.pid), { kbd: "N", icon: "gauge", disabled: !p })}
      <hr />
      {onToggle && item(row.expanded ? "Collapse" : "Expand", onToggle, { kbd: row.expanded ? "←" : "→", icon: row.expanded ? "up" : "down" })}
      {item(tagged && row.pids.every((pid) => targets.includes(pid)) ? "Untag" : "Tag", onTag, { kbd: "SPACE", icon: "check" })}
      {onParent && item("Go to parent", onParent, { kbd: "P", icon: "up" })}
      {p && item("Copy PID", () => copy(String(p.pid)), { icon: "note" })}
      {p && item("Copy command line", () => copy(p.cmd), { icon: "code" })}
      {item("Properties", onDetails, { kbd: "⏎", icon: "info" })}
    </div>
  );
}

