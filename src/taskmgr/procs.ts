// Process model for the task manager: a /proc-like table plus the pure logic the UI
// runs on it — tree building, clubbing children, grouping, filtering, sorting, signal
// delivery with real Linux semantics (permissions, handlers, reparenting to subreapers,
// zombies), renice, systemd units and a small simulation tick.

export type ProcState = "R" | "S" | "D" | "Z" | "T" | "I";

export const STATE_LABEL: Record<ProcState, string> = {
  R: "Running",
  S: "Sleeping",
  D: "Disk wait",
  Z: "Zombie",
  T: "Stopped",
  I: "Idle",
};

/** What a custom signal handler does. `exit` handlers clean up, then the process exits. */
export interface Handler {
  note: string;
  exit?: boolean;
}

export interface Proc {
  pid: number;
  ppid: number;
  /** comm: the kernel's 15-character process name. */
  name: string;
  /** Full command line (/proc/pid/cmdline). */
  cmd: string;
  user: string;
  state: ProcState;
  nice: number;
  threads: number;
  /** CPU, percent of one core (htop / Irix mode). */
  cpu: number;
  /** Private resident memory, KiB (USS). */
  uss: number;
  /** Shared resident memory (libraries, shmem), KiB. RSS = USS + shared. */
  shared: number;
  /** Proportional set size, KiB: USS plus this process's share of shared pages. */
  pss: number;
  /** Swapped out, KiB. */
  swap: number;
  /** Virtual size, KiB. */
  vsz: number;
  /** Disk I/O, bytes per second. */
  read: number;
  write: number;
  /** Seconds after boot the process started. */
  start: number;
  /** CPU time used, seconds. */
  cputime: number;
  tty?: string;
  cwd?: string;
  /** cgroup path below /sys/fs/cgroup, e.g. "system.slice/sshd.service". */
  unit: string;
  /** Friendly app name for "group by app"; inherited by descendants. */
  app?: string;
  icon?: string;
  kernel?: boolean;
  /** PR_SET_CHILD_SUBREAPER: orphaned descendants are reparented here, not to PID 1. */
  subreaper?: boolean;
  /** Exits when its parent does (IPC helpers, Wayland clients of the compositor, terminal jobs on hangup). */
  withParent?: boolean;
  /** Installed signal handlers, by signal number. */
  handlers?: Partial<Record<number, Handler>>;
  /** Simulation: typical CPU and memory growth (KiB/s). */
  base?: number;
  leak?: number;
}

export const rss = (p: Proc) => p.uss + p.shared;

// ───────── signals ─────────

export interface Signal {
  num: number;
  name: string;
  /** Default disposition. */
  action: "term" | "core" | "stop" | "cont" | "ign";
  desc: string;
  /** SIGKILL and SIGSTOP cannot be caught, blocked or ignored. */
  uncatchable?: boolean;
}

export const SIGNALS: Signal[] = [
  { num: 15, name: "SIGTERM", action: "term", desc: "Ask to terminate. The default for kill and End task; programs can clean up or ignore it." },
  { num: 9, name: "SIGKILL", action: "term", desc: "Kill immediately. Cannot be caught or ignored; no clean-up.", uncatchable: true },
  { num: 1, name: "SIGHUP", action: "term", desc: "Hang up: the terminal closed. Many daemons reload their config instead." },
  { num: 2, name: "SIGINT", action: "term", desc: "Interrupt, as Ctrl + C." },
  { num: 3, name: "SIGQUIT", action: "core", desc: "Quit and dump core, as Ctrl + \\." },
  { num: 6, name: "SIGABRT", action: "core", desc: "Abort and dump core." },
  { num: 19, name: "SIGSTOP", action: "stop", desc: "Pause. Cannot be caught or ignored.", uncatchable: true },
  { num: 20, name: "SIGTSTP", action: "stop", desc: "Terminal stop, as Ctrl + Z. Can be caught." },
  { num: 18, name: "SIGCONT", action: "cont", desc: "Continue a stopped process." },
  { num: 10, name: "SIGUSR1", action: "term", desc: "User-defined; meaning depends on the program." },
  { num: 12, name: "SIGUSR2", action: "term", desc: "User-defined; meaning depends on the program." },
  { num: 14, name: "SIGALRM", action: "term", desc: "Timer expired." },
  { num: 17, name: "SIGCHLD", action: "ign", desc: "A child changed state. Ignored by default." },
  { num: 28, name: "SIGWINCH", action: "ign", desc: "Terminal window resized. Ignored by default." },
];

export const signalByNum = (num: number) => SIGNALS.find((s) => s.num === num)!;

export type Outcome = "exited" | "stopped" | "continued" | "handled" | "ignored" | "protected" | "EPERM" | "ESRCH";

export interface SignalResult {
  pid: number;
  name: string;
  signal: number;
  outcome: Outcome;
  note: string;
  /** Other processes that exited as a consequence (helpers, terminal jobs, reaped zombies). */
  alsoExited: { pid: number; name: string }[];
  /** Orphans and where they went. */
  reparented: { pid: number; name: string; to: number }[];
}

export interface SignalOptions {
  /** The sending user; "root" after polkit authentication. */
  as: string;
  /** Signal the whole process tree below each target too. */
  tree?: boolean;
}

/** Map pid → children pids, in table order. */
export function childMap(procs: Proc[]): Map<number, Proc[]> {
  const m = new Map<number, Proc[]>();
  for (const p of procs) m.set(p.ppid, [...(m.get(p.ppid) ?? []), p]);
  return m;
}

export function descendants(procs: Proc[], pid: number): Proc[] {
  const kids = childMap(procs);
  const out: Proc[] = [];
  const walk = (id: number) => {
    for (const c of kids.get(id) ?? []) {
      out.push(c);
      walk(c.pid);
    }
  };
  walk(pid);
  return out;
}

export function ancestors(procs: Proc[], pid: number): Proc[] {
  const byPid = new Map(procs.map((p) => [p.pid, p]));
  const out: Proc[] = [];
  let p = byPid.get(byPid.get(pid)?.ppid ?? -1);
  while (p && out.length < 64) {
    out.unshift(p);
    p = byPid.get(p.ppid);
  }
  return out;
}

/** Would sending this need privileges the sender lacks? */
export const needsRoot = (p: Proc, as: string) => as !== "root" && p.user !== as;

/**
 * Deliver a signal the way the kernel would, against a copy of the table. Targets are
 * handled in order; with `tree`, each target's descendants are signalled too.
 */
export function sendSignal(procs: Proc[], pids: number[], sig: number, opts: SignalOptions): { procs: Proc[]; results: SignalResult[] } {
  const table = new Map(procs.map((p) => [p.pid, { ...p }]));
  const signal = signalByNum(sig);
  const targets: number[] = [];
  for (const pid of pids) {
    if (!targets.includes(pid)) targets.push(pid);
    if (opts.tree) for (const d of descendants(procs, pid)) if (!targets.includes(d.pid)) targets.push(d.pid);
  }

  const results: SignalResult[] = [];
  for (const pid of targets) {
    const p = table.get(pid);
    const base = { pid, signal: sig, alsoExited: [], reparented: [] };
    if (!p) {
      // Already gone (e.g. took its helpers with it earlier in this batch) — only an error if asked for directly.
      if (pids.includes(pid)) results.push({ ...base, name: "?", outcome: "ESRCH", note: "No such process." });
      continue;
    }
    const r: SignalResult = { ...base, name: p.name, outcome: "ignored", note: "" };
    results.push(r);
    if (needsRoot(p, opts.as)) {
      r.outcome = "EPERM";
      r.note = `Operation not permitted: owned by ${p.user}. Authenticate to send as root.`;
      continue;
    }
    if (p.kernel) {
      r.note = "Kernel threads don't take signals from user space.";
      continue;
    }
    if (p.state === "Z") {
      r.note = `Already dead (zombie); nothing left to signal. Its parent (PID ${p.ppid}) must reap it — end the parent instead.`;
      continue;
    }
    const handler = signal.uncatchable ? undefined : p.handlers?.[sig];
    const fatal = signal.action === "term" || signal.action === "core";
    if (p.pid === 1 && !handler && (fatal || signal.action === "stop")) {
      r.outcome = "protected";
      r.note = "PID 1 only receives signals it has a handler for — even SIGKILL is dropped.";
      continue;
    }
    if (handler && !handler.exit) {
      r.outcome = "handled";
      r.note = handler.note;
      continue;
    }
    if (signal.action === "cont") {
      r.outcome = "continued";
      r.note = p.state === "T" ? "Resumed." : "It wasn't stopped; nothing changed.";
      if (p.state === "T") p.state = "S";
      continue;
    }
    if (signal.action === "stop") {
      r.outcome = "stopped";
      r.note = "Paused. Send SIGCONT to resume.";
      p.state = "T";
      p.cpu = 0;
      continue;
    }
    if (signal.action === "ign" && !handler) {
      r.note = `Default action for ${signal.name} is to ignore it.`;
      continue;
    }
    r.outcome = "exited";
    r.note = handler?.note ?? (signal.action === "core" ? "Exited; core dumped (systemd-coredump)." : sig === 9 ? "Killed." : "Exited.");
    exit(table, p, r);
  }
  return { procs: procs.filter((p) => table.has(p.pid)).map((p) => table.get(p.pid)!), results };
}

/** Remove a dead process: its helpers die with it, zombies are reaped, everyone else is reparented. */
function exit(table: Map<number, Proc>, p: Proc, r: SignalResult) {
  table.delete(p.pid);
  let reaper = table.get(p.ppid);
  while (reaper && !reaper.subreaper && reaper.pid !== 1) reaper = table.get(reaper.ppid);
  const to = reaper?.pid ?? 1;
  for (const c of [...table.values()].filter((x) => x.ppid === p.pid)) {
    if (c.state === "Z" || c.withParent) {
      r.alsoExited.push({ pid: c.pid, name: c.state === "Z" ? `${c.name} <defunct>` : c.name });
      exit(table, c, r);
    } else {
      c.ppid = to;
      r.reparented.push({ pid: c.pid, name: c.name, to });
    }
  }
}

/** Change niceness. Unprivileged users may only lower priority (raise nice) of their own processes. */
export function renice(procs: Proc[], pid: number, nice: number, as: string): { procs: Proc[]; ok: boolean; note: string } {
  const p = procs.find((x) => x.pid === pid);
  const n = Math.max(-20, Math.min(19, Math.round(nice)));
  if (!p) return { procs, ok: false, note: "No such process." };
  if (p.kernel && as !== "root") return { procs, ok: false, note: "Operation not permitted." };
  if (needsRoot(p, as)) return { procs, ok: false, note: `Owned by ${p.user}; authenticate to renice.` };
  if (as !== "root" && n < p.nice) return { procs, ok: false, note: "Only root can raise priority (lower the nice value)." };
  return { procs: procs.map((x) => (x.pid === pid ? { ...x, nice: n } : x)), ok: true, note: `nice ${p.nice} → ${n}` };
}

export const PRIORITIES = [
  { nice: -20, label: "Realtime-ish", hint: "-20" },
  { nice: -10, label: "High", hint: "-10" },
  { nice: -5, label: "Above normal", hint: "-5" },
  { nice: 0, label: "Normal", hint: "0" },
  { nice: 5, label: "Below normal", hint: "5" },
  { nice: 10, label: "Low", hint: "10" },
  { nice: 19, label: "Lowest", hint: "19" },
];

// ───────── totals, rows, grouping ─────────

export type MemMetric = "uss" | "pss" | "rss";

export const memOf = (p: Proc, m: MemMetric) => (m === "rss" ? rss(p) : p[m]);

export interface Totals {
  count: number;
  cpu: number;
  mem: number;
  uss: number;
  pss: number;
  rss: number;
  swap: number;
  vsz: number;
  read: number;
  write: number;
  threads: number;
}

export function totals(list: Proc[], metric: MemMetric): Totals {
  const t: Totals = { count: 0, cpu: 0, mem: 0, uss: 0, pss: 0, rss: 0, swap: 0, vsz: 0, read: 0, write: 0, threads: 0 };
  for (const p of list) {
    t.count++;
    t.cpu += p.cpu;
    t.mem += memOf(p, metric);
    t.uss += p.uss;
    t.pss += p.pss;
    t.rss += rss(p);
    t.swap += p.swap;
    t.vsz += p.vsz;
    t.read += p.read;
    t.write += p.write;
    t.threads += p.threads;
  }
  return t;
}

export type ViewMode = "tree" | "list" | "group";
export type GroupBy = "app" | "name" | "user" | "unit";
export type SortKey = "name" | "pid" | "user" | "state" | "cpu" | "mem" | "swap" | "vsz" | "threads" | "disk" | "nice" | "start" | "time";

export interface ViewOptions {
  mode: ViewMode;
  groupBy: GroupBy;
  /** Show each row's values summed with its descendants (tree / list), i.e. club children in. */
  club: boolean;
  metric: MemMetric;
  sort: SortKey;
  desc: boolean;
  query: string;
  hideKernel: boolean;
  /** Only this user's processes. */
  onlyUser?: string;
  /** Rows whose expansion differs from the default (tree: expanded, groups: collapsed). */
  toggled: ReadonlySet<string>;
}

export interface Row {
  key: string;
  kind: "proc" | "group";
  proc?: Proc;
  label: string;
  icon?: string;
  depth: number;
  /** Tree guide prefix, one entry per ancestor level: does a line continue down? */
  guides: boolean[];
  /** Last among its siblings (└ instead of ├). */
  last: boolean;
  hasChildren: boolean;
  expanded: boolean;
  /** Processes the row stands for: itself plus clubbed / hidden descendants, or a group's members. */
  count: number;
  /** Values shown in the columns. */
  shown: Totals;
  /** Matches the search (false = kept only as context for a matching descendant). */
  match: boolean;
  /** Processes an action on this row targets. */
  pids: number[];
}

export const appOf = (procs: Map<number, Proc>, p: Proc): string => {
  for (let q: Proc | undefined = p; q; q = procs.get(q.ppid)) if (q.app) return q.app;
  if (p.kernel) return "Kernel threads";
  return p.user === "root" || p.unit.startsWith("system.slice") || p.unit === "init.scope" ? "System services" : "Background processes";
};

const groupKey = (byPid: Map<number, Proc>, p: Proc, by: GroupBy) =>
  by === "app" ? appOf(byPid, p) : by === "name" ? p.name : by === "user" ? p.user : p.unit.split("/").pop()!;

const matches = (p: Proc, q: string) => !q || `${p.pid} ${p.name} ${p.cmd} ${p.user} ${p.unit}`.toLowerCase().includes(q.toLowerCase());

function sortValue(r: Row, key: SortKey): number | string {
  const p = r.proc;
  switch (key) {
    case "name": return r.label.toLowerCase();
    case "pid": return p?.pid ?? 0;
    case "user": return p?.user ?? "";
    case "state": return p?.state ?? "";
    case "cpu": return r.shown.cpu;
    case "mem": return r.shown.mem;
    case "swap": return r.shown.swap;
    case "vsz": return r.shown.vsz;
    case "threads": return r.shown.threads;
    case "disk": return r.shown.read + r.shown.write;
    case "nice": return p?.nice ?? 0;
    case "start": return p?.start ?? 0;
    case "time": return p?.cputime ?? 0;
  }
}

export function sortRows<T extends Row>(rows: T[], key: SortKey, desc: boolean): T[] {
  const dir = desc ? -1 : 1;
  return [...rows].sort((a, b) => {
    const x = sortValue(a, key), y = sortValue(b, key);
    const c = typeof x === "string" ? x.localeCompare(y as string) : x - (y as number);
    return c * dir || (a.proc?.pid ?? 0) - (b.proc?.pid ?? 0) || a.label.localeCompare(b.label);
  });
}

/** Filter, build and flatten the table into the visible rows for a view. */
export function buildRows(all: Proc[], o: ViewOptions): Row[] {
  const procs = all.filter((p) => !(o.hideKernel && p.kernel) && !(o.onlyUser && p.user !== o.onlyUser));
  const byPid = new Map(procs.map((p) => [p.pid, p]));
  const kids = childMap(procs);
  const q = o.query.trim();

  // Subtree membership, memoised.
  const subtree = new Map<number, Proc[]>();
  const sub = (p: Proc): Proc[] => {
    let s = subtree.get(p.pid);
    if (!s) {
      s = [p, ...(kids.get(p.pid) ?? []).flatMap(sub)];
      subtree.set(p.pid, s);
    }
    return s;
  };
  const hit = (p: Proc) => matches(p, q);
  const procRow = (p: Proc, depth: number, guides: boolean[], last: boolean, children: Proc[], expanded: boolean): Row => {
    const members = o.club ? sub(p) : [p];
    return {
      key: `p:${p.pid}`,
      kind: "proc",
      proc: p,
      label: p.name,
      icon: p.icon,
      depth,
      guides,
      last,
      hasChildren: children.length > 0,
      expanded,
      count: o.club || !expanded ? sub(p).length : 1,
      shown: totals(members, o.metric),
      match: hit(p),
      pids: [p.pid],
    };
  };

  if (o.mode === "list") {
    const rows = procs.filter(hit).map((p) => procRow(p, 0, [], true, [], true));
    return sortRows(rows, o.sort, o.desc).map((r) => ({ ...r, count: o.club ? sub(r.proc!).length : 1 }));
  }

  if (o.mode === "tree") {
    const out: Row[] = [];
    const keep = (p: Proc) => !q || sub(p).some(hit);
    const walk = (list: Proc[], depth: number, guides: boolean[]) => {
      const visible = list.filter(keep);
      const rows = sortRows(
        visible.map((p) => {
          const children = (kids.get(p.pid) ?? []).filter(keep);
          const expanded = children.length > 0 && (!!q || !o.toggled.has(`p:${p.pid}`));
          return procRow(p, depth, guides, false, children, expanded);
        }),
        o.sort,
        o.desc,
      );
      rows.forEach((r, i) => {
        r.last = i === rows.length - 1;
        out.push(r);
        if (r.expanded) walk(kids.get(r.proc!.pid) ?? [], depth + 1, [...guides, !r.last]);
      });
    };
    walk(procs.filter((p) => !byPid.has(p.ppid)), 0, []);
    return out;
  }

  // Grouped: one row per key, members below.
  const groups = new Map<string, Proc[]>();
  const allByPid = new Map(all.map((x) => [x.pid, x]));
  for (const p of procs.filter(hit)) {
    const k = groupKey(allByPid, p, o.groupBy);
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  const heads = sortRows(
    [...groups].map(([label, members]): Row => {
      const head = members.find((m) => m.app === label) ?? members[0]!;
      return {
        key: `g:${label}`,
        kind: "group",
        label,
        icon: head.icon ?? (head.kernel ? "cpu" : head.user === "root" ? "settings" : "app"),
        proc: members.length === 1 ? head : undefined,
        depth: 0,
        guides: [],
        last: false,
        hasChildren: members.length > 1,
        expanded: members.length > 1 && (!!q || o.toggled.has(`g:${label}`)),
        count: members.length,
        shown: totals(members, o.metric),
        match: true,
        pids: members.map((m) => m.pid),
      };
    }),
    o.sort,
    o.desc,
  );
  return heads.flatMap((h) => {
    if (!h.expanded) return [h];
    const members = sortRows(
      groups.get(h.label)!.map((p) => procRow(p, 1, [], false, [], true)).map((r) => ({ ...r, key: `${h.key}/${r.key}`, count: 1, shown: totals([r.proc!], o.metric) })),
      o.sort,
      o.desc,
    );
    members.forEach((m, i) => (m.last = i === members.length - 1));
    return [h, ...members];
  });
}

// ───────── machine summary ─────────

export interface Machine {
  cpuModel: string;
  /** Logical CPUs. */
  threads: number;
  ghz: number;
  memTotal: number;
  swapTotal: number;
  /** Kernel, slab, page tables… KiB, outside any process. */
  kernelMem: number;
  cached: number;
  buffers: number;
  /** Seconds since boot. */
  uptime: number;
  hostname: string;
  kernel: string;
}

export interface Summary {
  tasks: number;
  threads: number;
  running: number;
  sleeping: number;
  stopped: number;
  zombie: number;
  kernelThreads: number;
  /** % of the whole machine. */
  cpu: number;
  memUsed: number;
  swapUsed: number;
  read: number;
  write: number;
  load: [number, number, number];
}

export function summarise(procs: Proc[], m: Machine, load: [number, number, number]): Summary {
  const t = totals(procs, "pss");
  return {
    tasks: procs.length,
    threads: t.threads,
    running: procs.filter((p) => p.state === "R").length,
    sleeping: procs.filter((p) => p.state === "S" || p.state === "I" || p.state === "D").length,
    stopped: procs.filter((p) => p.state === "T").length,
    zombie: procs.filter((p) => p.state === "Z").length,
    kernelThreads: procs.filter((p) => p.kernel).length,
    cpu: Math.min(100, t.cpu / m.threads),
    memUsed: t.pss + m.kernelMem,
    swapUsed: t.swap,
    read: t.read,
    write: t.write,
    load,
  };
}

// ───────── systemd units ─────────

export interface Unit {
  /** e.g. "sshd.service" */
  name: string;
  scope: "system" | "user";
  description: string;
  enabled: boolean;
  /** Last result when no process is running. */
  result?: "exited" | "failed" | "inactive";
  failure?: string;
  /** What the unit starts (pids are placeholders, remapped on start). */
  template: Proc[];
  /** Does `systemctl reload` work (ExecReload / HUP handler)? */
  reload?: boolean;
  /** Oneshot: runs and exits. */
  oneshot?: boolean;
}

export const cgroupOf = (u: Pick<Unit, "name" | "scope">) => (u.scope === "system" ? `system.slice/${u.name}` : u.name);

export const unitProcs = (procs: Proc[], u: Unit) => procs.filter((p) => (u.scope === "system" ? p.unit === cgroupOf(u) : p.unit.startsWith("user@") && p.unit.endsWith(`/${u.name}`)));

export type UnitState = "running" | "exited" | "failed" | "inactive";

export function unitState(procs: Proc[], u: Unit, results: Record<string, UnitState | undefined>): UnitState {
  if (unitProcs(procs, u).length) return "running";
  return results[u.name] ?? u.result ?? "inactive";
}

/** The unit's main process: the one whose parent is outside the cgroup. */
export function mainPid(procs: Proc[], u: Unit): number | undefined {
  const members = unitProcs(procs, u);
  const ids = new Set(members.map((p) => p.pid));
  return members.find((p) => !ids.has(p.ppid))?.pid;
}

/** Spawn a unit's processes with fresh pids under `parent` (PID 1, or the user's systemd). */
export function spawn(procs: Proc[], template: Proc[], parent: number, nextPid: number, now: number): { procs: Proc[]; nextPid: number } {
  const map = new Map<number, number>();
  for (const t of template) map.set(t.pid, nextPid++);
  const fresh = template.map((t) => ({ ...t, pid: map.get(t.pid)!, ppid: map.get(t.ppid) ?? parent, start: now, cputime: 0, state: "S" as ProcState }));
  return { procs: [...procs, ...fresh], nextPid };
}

// ───────── simulation ─────────

/** Small deterministic PRNG (mulberry32), so stories and tests are repeatable. */
export function rng(seed = 7) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Advance the table by `dt` seconds: CPU wanders around each process's base, leaks grow, disks spike. */
export function tick(procs: Proc[], rand: () => number, dt = 1): Proc[] {
  return procs.map((p) => {
    if (p.state === "Z" || p.state === "T") return p.cpu ? { ...p, cpu: 0, read: 0, write: 0 } : p;
    const base = p.base ?? p.cpu;
    const jitter = (rand() - 0.5) * Math.max(0.4, base * 0.5);
    const burst = rand() < 0.03 ? rand() * 25 : 0;
    const cpu = Math.max(0, Math.min(100 * p.threads, base + jitter + burst));
    const uss = Math.max(0, p.uss + (p.leak ?? 0) * dt + (p.kernel ? 0 : (rand() - 0.5) * p.uss * 0.004));
    const io = rand() < 0.15 ? 1 : 0;
    return {
      ...p,
      cpu: Math.round(cpu * 10) / 10,
      uss: Math.round(uss),
      pss: Math.round(p.pss + (uss - p.uss)),
      read: p.kernel ? 0 : Math.round(io * rand() * (p.read > 0 ? 4 : 0.2) * 1024 * 256),
      write: p.kernel ? 0 : Math.round(rand() < 0.1 ? rand() * (p.write > 0 ? 3 : 0.1) * 1024 * 256 : 0),
      cputime: p.cputime + (cpu / 100) * dt,
      state: p.kernel ? p.state : cpu > 40 ? "R" : p.state === "D" ? "D" : "S",
    };
  });
}

// ───────── formatting ─────────

export function fmtKiB(kib: number): string {
  if (kib < 1024) return `${Math.round(kib)} KiB`;
  if (kib < 1024 * 1024) return `${(kib / 1024).toFixed(kib < 10 * 1024 ? 1 : 0)} MiB`;
  return `${(kib / 1024 / 1024).toFixed(2)} GiB`;
}

export function fmtRate(bps: number): string {
  if (bps <= 0) return "0";
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(0)} KiB/s`;
  return `${(bps / 1024 / 1024).toFixed(1)} MiB/s`;
}

export function fmtDuration(s: number): string {
  const t = Math.floor(s);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  const mm = String(m).padStart(2, "0"), ss = String(sec).padStart(2, "0");
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : h ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export const fmtCpu = (pct: number) => (pct >= 10 ? pct.toFixed(0) : pct.toFixed(1));
