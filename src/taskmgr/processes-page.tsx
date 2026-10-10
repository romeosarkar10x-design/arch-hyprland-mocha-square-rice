import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { Button, Icon, cx } from "../ui";
import type { Ask } from "./dialogs";
import { MACHINE, ME } from "./demo";
import { ProcessDetails } from "./process-details";
import { ContextMenu } from "./process-menu";
import { columns, HeadCell, METRIC_HELP, ProcRow, TableHead } from "./process-table";
import { buildRows, fmtRate, summarise, type GroupBy, type MemMetric, type Row, type SortKey, type ViewMode } from "./procs";
import type { Action, TM } from "./store";
import { check, menu as menuCls, search, seg, segButton, select, toolbar } from "./styles";

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
      const el = tableRef.current?.querySelector('[role="row"][aria-selected="true"]')?.getBoundingClientRect();
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
    <div data-component="ProcessesPage" className="relative flex min-h-0 flex-1 flex-col" ref={rootRef} onKeyDown={onKeyDown} onClick={() => (setMenu(null), setColsOpen(false))}>
      <ProcToolbar
        v={v}
        set={set}
        uptime={tm.uptime}
        searchRef={searchRef}
        onSearchDone={() => tableRef.current?.focus()}
        colsOpen={colsOpen}
        onCols={() => setColsOpen((o) => !o)}
        targets={targets}
        ask={ask}
        onDetails={() => setDetails((d) => !d)}
      />

      <div className={cx("grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)]", details && proc && "grid-cols-[minmax(0,1fr)_380px]")}>
        <div className="group/table min-h-0 overflow-auto tabular-nums outline-none" ref={tableRef} tabIndex={0} role="treegrid" aria-label="Processes" style={{ "--rx-tm-grid": grid } as CSSProperties}>
          <TableHead>
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
          </TableHead>
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
            <div className="flex flex-col items-center gap-1.5 px-5 py-[60px] text-overlay1">
              <Icon name="search" size={28} />
              <b>No processes match “{v.query}”</b>
              <span className="text-overlay1">{v.hideKernel && "Kernel threads are hidden. "}Esc clears the search.</span>
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

      <footer className="flex flex-none items-center gap-3.5 overflow-hidden border-t border-surface0 px-2.5 py-[5px] text-[11px] whitespace-nowrap text-overlay1">
        {tagged.size > 0 && (
          <span className="text-yellow">
            {tagged.size} tagged · actions apply to tagged{" "}
            <button type="button" className="unbutton cursor-pointer px-1 text-yellow underline" onClick={() => setTagged(new Set())}>
              clear (u)
            </button>
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

interface ProcToolbarProps {
  v: ProcView;
  set: (patch: Partial<ProcView>) => void;
  uptime: number;
  searchRef: RefObject<HTMLInputElement | null>;
  /** Enter / Esc in the search box hands focus back to the table. */
  onSearchDone: () => void;
  colsOpen: boolean;
  onCols: () => void;
  targets: number[];
  ask: Ask;
  onDetails: () => void;
}

/** Search, view mode, filters, memory / CPU scale, columns and the actions for the selection. */
function ProcToolbar({ v, set, uptime, searchRef, onSearchDone, colsOpen, onCols, targets, ask, onDetails }: ProcToolbarProps) {
  return (
  <div data-component="ProcToolbar" className={toolbar}>
    <label className={search}>
      <Icon name="search" size={14} />
      <input ref={searchRef} value={v.query} placeholder="Name, PID, user, command…  ( / )" onChange={(e) => set({ query: e.target.value })} onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") {
          if (e.key === "Escape") set({ query: "" });
          onSearchDone();
        }
      }} />
    </label>
    <div className={seg} role="radiogroup" aria-label="View">
      {(["tree", "list", "group"] as const).map((m) => (
        <button key={m} type="button" role="radio" aria-checked={v.mode === m} className={segButton} onClick={() => set({ mode: m })} title={m === "tree" ? "Process tree (t / F5)" : m === "list" ? "Flat list (t)" : "Grouped (g)"}>
          {m === "tree" ? "Tree" : m === "list" ? "List" : "Grouped"}
        </button>
      ))}
    </div>
    {v.mode === "group" && (
      <select className={select} value={v.groupBy} onChange={(e) => set({ groupBy: e.target.value as GroupBy })} aria-label="Group by">
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
    <select className={select} value={v.metric} onChange={(e) => set({ metric: e.target.value as MemMetric })} title={METRIC_HELP[v.metric]} aria-label="Memory metric">
      <option value="pss">Memory: PSS</option>
      <option value="uss">Memory: USS</option>
      <option value="rss">Memory: RSS</option>
    </select>
    <select className={select} value={v.cpuScale} onChange={(e) => set({ cpuScale: e.target.value as ProcView["cpuScale"] })} aria-label="CPU scale">
      <option value="total">CPU: % of total</option>
      <option value="core">CPU: % of a core</option>
    </select>
    <span className="flex-1" />
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <Button size="sm" variant="ghost" icon="settings" onClick={() => onCols()}>
        Columns
      </Button>
      {colsOpen && (
        <div data-component="ColumnPicker" className={cx(menuCls, "top-[30px] right-0 max-h-[420px] gap-0.5 overflow-auto px-2 py-1.5")}>
          {ALL_COLS.map((id) => (
            <label key={id} className={cx(check, "py-[3px]")}>
              <input type="checkbox" checked={v.columns.includes(id)} onChange={() => set({ columns: v.columns.includes(id) ? v.columns.filter((c) => c !== id) : ALL_COLS.filter((c) => c === id || v.columns.includes(c)) })} />
              {columns(v, uptime).find((c) => c.id === id)!.label} <span className="text-overlay1">{columns(v, uptime).find((c) => c.id === id)!.title?.split(":")[0]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
    <Button size="sm" variant="ghost" icon="info" onClick={() => onDetails()} kbd="⏎">
      Properties
    </Button>
    <Button size="sm" variant="secondary" icon="flash" disabled={!targets.length} onClick={() => ask.signal(targets)} kbd="K">
      Signal
    </Button>
    <Button size="sm" variant="danger" icon="close" disabled={!targets.length} onClick={() => ask.send(targets, 15)} kbd="DEL">
      End task{targets.length > 1 ? ` (${targets.length})` : ""}
    </Button>
  </div>
  );
}

function Chip({ on, disabled, onClick, title, children }: { on: boolean; disabled?: boolean; onClick: () => void; title?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      data-component="Chip"
      className={cx(
        "unbutton inline-flex h-[26px] cursor-pointer items-center gap-1.5 border border-surface0 px-2.5 whitespace-nowrap disabled:cursor-default disabled:opacity-40",
        on && "border-mauve/60 text-text",
      )}
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <i className={cx("size-2", on ? "bg-mauve" : "shadow-[inset_0_0_0_1px_var(--hx-overlay0)]")} />
      {children}
    </button>
  );
}
