// The task manager's state as a pure reducer: simulation ticks, signals, renice, systemd
// unit jobs and startup entries, with polkit-style authentication (cached for five
// minutes, like auth_admin_keep) whenever an action needs root.

import { demoProcs, demoUnits, MACHINE, ME, STARTUP } from "./demo.ts";
import {
  descendants,
  mainPid,
  renice,
  rng,
  sendSignal,
  signalByNum,
  spawn,
  summarise,
  tick,
  unitProcs,
  unitState,
  type Proc,
  type SignalResult,
  type Unit,
  type UnitState,
} from "./procs.ts";

export const HISTORY = 60;
const ROOT_CACHE = 300;

export interface History {
  cpu: number[];
  mem: number[];
  swap: number[];
  read: number[];
  write: number[];
  rx: number[];
  tx: number[];
  gpu: number[];
  /** Latest per-thread usage. */
  cores: number[];
}

export interface LogEntry {
  id: number;
  /** Uptime, seconds. */
  at: number;
  tone: "ok" | "info" | "warn" | "err";
  text: string;
  detail?: string;
  /** A suggested follow-up, e.g. SIGKILL after an ignored SIGTERM. */
  retry?: { label: string; pids: number[]; sig: number };
}

export type UnitOp = "start" | "stop" | "restart" | "reload" | "enable" | "disable";

export type Pending =
  | { kind: "signal"; pids: number[]; sig: number; tree: boolean }
  | { kind: "renice"; pid: number; nice: number }
  | { kind: "unit"; name: string; op: UnitOp };

export interface TM {
  procs: Proc[];
  /** Boot snapshot, for respawning startup entries. */
  initial: Proc[];
  units: Unit[];
  unitResult: Record<string, UnitState | undefined>;
  /** Enable-state overrides for units ("unit:<name>") and startup entries ("startup:<name>"). */
  enabled: Record<string, boolean>;
  nextPid: number;
  uptime: number;
  load: [number, number, number];
  hist: History;
  /** Per-process CPU (% of machine) and PSS (KiB) history. */
  ph: Record<number, { cpu: number[]; mem: number[] }>;
  log: LogEntry[];
  seq: number;
  /** Root authorisation lasts until this uptime. */
  rootUntil: number;
  auth: null | { pending: Pending; command: string; failed: boolean };
}

export type Action =
  | { type: "tick"; dt: number; seed: number }
  | { type: "signal"; pids: number[]; sig: number; tree?: boolean }
  | { type: "renice"; pid: number; nice: number }
  | { type: "unit"; name: string; op: UnitOp }
  | { type: "startup"; name: string; op: "run" | "enable" | "disable" }
  | { type: "authorize"; password: string }
  | { type: "cancelAuth" }
  | { type: "dropRoot" }
  | { type: "clearLog" }
  | { type: "reset" };

const push = (xs: number[], v: number) => [...xs.slice(-(HISTORY - 1)), v];

export function initTM(seed = 3): TM {
  const procs = demoProcs();
  let s: TM = {
    procs,
    initial: procs,
    units: demoUnits(procs),
    unitResult: {},
    enabled: {},
    nextPid: 10000,
    uptime: MACHINE.uptime,
    load: [1.42, 1.18, 0.97],
    hist: { cpu: [], mem: [], swap: [], read: [], write: [], rx: [], tx: [], gpu: [], cores: [] },
    ph: {},
    log: [],
    seq: 0,
    rootUntil: 0,
    auth: null,
  };
  // Pre-fill a minute of history so graphs aren't empty on first paint.
  for (let i = 0; i < HISTORY; i++) s = step(s, 1, seed * 1000 + i);
  return s;
}

export const isRoot = (s: TM) => s.uptime < s.rootUntil;

function step(s: TM, dt: number, seed: number): TM {
  const rand = rng(seed);
  const procs = tick(s.procs, rand, dt);
  const sum = summarise(procs, MACHINE, s.load);
  const busy = procs.reduce((n, p) => n + p.cpu, 0) / 100;
  const decay = (period: number) => Math.exp(-dt / period);
  const load = [60, 300, 900].map((t, i) => s.load[i]! * decay(t) + busy * (1 - decay(t))) as TM["load"];
  const cores = Array.from({ length: MACHINE.threads }, (_, i) => {
    const v = sum.cpu + (rand() - 0.5) * Math.max(6, sum.cpu) + (i === Math.floor(rand() * MACHINE.threads) ? 60 : 0);
    return Math.round(Math.max(0, Math.min(100, v)));
  });
  const ph: TM["ph"] = {};
  for (const p of procs) {
    const h = s.ph[p.pid] ?? { cpu: [], mem: [] };
    ph[p.pid] = { cpu: push(h.cpu, p.cpu / MACHINE.threads), mem: push(h.mem, p.pss) };
  }
  return {
    ...s,
    procs,
    uptime: s.uptime + dt,
    load,
    ph,
    hist: {
      cpu: push(s.hist.cpu, sum.cpu),
      mem: push(s.hist.mem, (sum.memUsed / MACHINE.memTotal) * 100),
      swap: push(s.hist.swap, (sum.swapUsed / MACHINE.swapTotal) * 100),
      read: push(s.hist.read, sum.read + rand() * 2e6 * (rand() < 0.2 ? 6 : 0.4)),
      write: push(s.hist.write, sum.write + rand() * 1e6),
      rx: push(s.hist.rx, 40_000 + rand() * 900_000 * (rand() < 0.25 ? 4 : 1)),
      tx: push(s.hist.tx, 8_000 + rand() * 120_000),
      gpu: push(s.hist.gpu, Math.round(8 + rand() * 10 + (s.hist.gpu.at(-1) ?? 12) * 0.5)),
      cores,
    },
  };
}

const log = (s: TM, e: Omit<LogEntry, "id" | "at">): TM => ({ ...s, seq: s.seq + 1, log: [{ ...e, id: s.seq + 1, at: s.uptime }, ...s.log].slice(0, 80) });

const needAuth = (s: TM, pending: Pending, command: string): TM => ({ ...s, auth: { pending, command, failed: false } });

function describe(sig: number, results: SignalResult[]): Omit<LogEntry, "id" | "at"> {
  const name = signalByNum(sig).name;
  const one = results.length === 1 ? results[0]! : undefined;
  const tone = (o: SignalResult["outcome"]): LogEntry["tone"] => (o === "exited" || o === "stopped" || o === "continued" ? "ok" : o === "handled" ? "info" : o === "EPERM" || o === "ESRCH" ? "err" : "warn");
  const shrugged = results.filter((r) => r.outcome === "handled" && [15, 2, 1, 3].includes(sig));
  const retry = shrugged.length ? { label: "Send SIGKILL", pids: shrugged.map((r) => r.pid), sig: 9 } : undefined;
  const extra = (r: SignalResult) =>
    [
      r.alsoExited.length ? `${r.alsoExited.length} more exited with it: ${r.alsoExited.slice(0, 6).map((x) => `${x.name} (${x.pid})`).join(", ")}${r.alsoExited.length > 6 ? ", …" : ""}.` : "",
      r.reparented.length ? `Orphans reparented to PID ${r.reparented[0]!.to}: ${r.reparented.map((x) => `${x.name} (${x.pid})`).join(", ")}.` : "",
    ].filter(Boolean).join(" ");
  if (one) return { tone: tone(one.outcome), text: `${name} → ${one.name} (${one.pid}): ${one.outcome}`, detail: [one.note, extra(one)].filter(Boolean).join(" "), retry };
  const counts = new Map<string, number>();
  for (const r of results) counts.set(r.outcome, (counts.get(r.outcome) ?? 0) + 1);
  const worst = results.some((r) => tone(r.outcome) === "err") ? "err" : results.some((r) => tone(r.outcome) === "warn") ? "warn" : "ok";
  return {
    tone: worst,
    text: `${name} → ${results.length} processes: ${[...counts].map(([o, n]) => `${n} ${o}`).join(", ")}`,
    detail: results.filter((r) => r.outcome !== "exited").slice(0, 4).map((r) => `${r.name} (${r.pid}): ${r.note}`).join(" "),
    retry,
  };
}

function doSignal(s: TM, pids: number[], sig: number, tree: boolean): TM {
  const as = isRoot(s) ? "root" : ME;
  const r = sendSignal(s.procs, pids, sig, { as, tree });
  const denied = r.results.filter((x) => x.outcome === "EPERM").map((x) => x.pid);
  const done = r.results.filter((x) => x.outcome !== "EPERM");
  let next: TM = { ...s, procs: r.procs };
  if (done.length) next = log(next, describe(sig, done));
  if (denied.length) next = needAuth(next, { kind: "signal", pids: denied, sig, tree: false }, `/usr/bin/kill -s ${signalByNum(sig).name.slice(3)} ${denied.join(" ")}`);
  return next;
}

function doRenice(s: TM, pid: number, nice: number): TM {
  const as = isRoot(s) ? "root" : ME;
  const r = renice(s.procs, pid, nice, as);
  const p = s.procs.find((x) => x.pid === pid);
  if (r.ok) return log({ ...s, procs: r.procs }, { tone: "ok", text: `renice ${p?.name} (${pid}): ${r.note}` });
  if (as !== "root" && p) return needAuth(s, { kind: "renice", pid, nice }, `/usr/bin/renice -n ${nice} -p ${pid}`);
  return log(s, { tone: "err", text: `renice ${p?.name ?? pid}: failed`, detail: r.note });
}

function doUnit(s: TM, name: string, op: UnitOp): TM {
  const u = s.units.find((x) => x.name === name);
  if (!u) return s;
  const root = isRoot(s);
  if (u.scope === "system" && !root) return needAuth(s, { kind: "unit", name, op }, `systemctl ${op} ${name}`);
  const as = root ? "root" : ME;
  const ctl = u.scope === "user" ? "systemctl --user" : "systemctl";
  const state = unitState(s.procs, u, s.unitResult);

  if (op === "enable" || op === "disable") {
    return log({ ...s, enabled: { ...s.enabled, [`unit:${name}`]: op === "enable" } }, { tone: "ok", text: `${ctl} ${op} ${name}`, detail: op === "enable" ? `Created symlink for ${name}.` : `Removed symlink for ${name}.` });
  }
  if (op === "reload") {
    const pid = mainPid(s.procs, u);
    if (state !== "running" || pid === undefined) return log(s, { tone: "err", text: `${ctl} reload ${name}: unit is not active.` });
    if (!u.reload) return log(s, { tone: "err", text: `${ctl} reload ${name}: Job type reload is not applicable for unit ${name}.` });
    return log({ ...doSignal(s, [pid], 1, false), log: s.log, seq: s.seq }, { tone: "ok", text: `${ctl} reload ${name}`, detail: s.procs.find((p) => p.pid === pid)?.handlers?.[1]?.note ?? "Sent SIGHUP to the main process." });
  }
  let next = s;
  if (op === "stop" || op === "restart") {
    const pids = unitProcs(s.procs, u).map((p) => p.pid);
    if (pids.length) {
      // systemd: SIGTERM to the whole cgroup, then SIGKILL whatever is left after TimeoutStopSec.
      let r = sendSignal(next.procs, pids, 15, { as });
      const left = pids.filter((pid) => r.procs.some((p) => p.pid === pid));
      if (left.length) r = sendSignal(r.procs, left, 9, { as });
      next = { ...next, procs: r.procs, unitResult: { ...next.unitResult, [name]: "inactive" } };
      next = log(next, { tone: "ok", text: `${ctl} stop ${name}`, detail: `Stopped ${u.description}. ${pids.length} process${pids.length > 1 ? "es" : ""} ended${left.length ? `; ${left.length} needed SIGKILL after the stop timeout` : ""}.` });
    } else if (op === "stop") {
      return log(s, { tone: "info", text: `${ctl} stop ${name}: already inactive.` });
    }
  }
  if (op === "start" || op === "restart") {
    if (op === "start" && state === "running") return log(s, { tone: "info", text: `${ctl} start ${name}: already running.` });
    if (u.oneshot) return log({ ...next, unitResult: { ...next.unitResult, [name]: "exited" } }, { tone: "ok", text: `${ctl} start ${name}`, detail: "Oneshot ran and exited with status=0/SUCCESS." });
    if (!u.template.length) {
      return log({ ...next, unitResult: { ...next.unitResult, [name]: "failed" } }, { tone: "err", text: `${ctl} start ${name}: Job failed.`, detail: `${u.failure ?? "Main process exited with an error."} See journalctl -xeu ${name}.` });
    }
    const parent = u.scope === "system" ? 1 : next.procs.find((p) => p.name === "systemd" && p.user === ME)?.pid;
    if (parent === undefined) return log(next, { tone: "err", text: `${ctl} start ${name}: user manager is not running.` });
    const r = spawn(next.procs, u.template, parent, next.nextPid, next.uptime);
    next = log({ ...next, procs: r.procs, nextPid: r.nextPid, unitResult: { ...next.unitResult, [name]: undefined } }, { tone: "ok", text: `${ctl} ${op} ${name}`, detail: `Started ${u.description} (main PID ${next.nextPid}).` });
  }
  return next;
}

function doStartup(s: TM, name: string, op: "run" | "enable" | "disable"): TM {
  const e = STARTUP.find((x) => x.name === name);
  if (!e) return s;
  if (op !== "run") return log({ ...s, enabled: { ...s.enabled, [`startup:${name}`]: op === "enable" } }, { tone: "ok", text: `${op === "enable" ? "Enabled" : "Disabled"} ${e.command} in hyprland.lua` });
  if (!e.match) return log(s, { tone: "ok", text: `hl.exec_cmd("${e.command}")`, detail: "Ran and exited." });
  if (s.procs.some((p) => p.name === e.match)) return log(s, { tone: "info", text: `${e.command}: already running.` });
  const hypr = s.procs.find((p) => p.name === "Hyprland");
  const head = s.initial.find((p) => p.name === e.match);
  if (!hypr) return log(s, { tone: "err", text: `${e.command}: Hyprland isn't running.` });
  if (!head) return log(s, { tone: "err", text: `${e.command}: command not found.`, detail: `zsh: command not found: ${e.command}` });
  const r = spawn(s.procs, [head, ...descendants(s.initial, head.pid)], hypr.pid, s.nextPid, s.uptime);
  return log({ ...s, procs: r.procs, nextPid: r.nextPid }, { tone: "ok", text: `hl.exec_cmd("${e.command}")`, detail: `Started as PID ${s.nextPid}.` });
}

function replay(s: TM, p: Pending): TM {
  if (p.kind === "signal") return doSignal(s, p.pids, p.sig, p.tree);
  if (p.kind === "renice") return doRenice(s, p.pid, p.nice);
  return doUnit(s, p.name, p.op);
}

export function reducer(s: TM, a: Action): TM {
  switch (a.type) {
    case "tick":
      return step(s, a.dt, a.seed);
    case "signal":
      return doSignal(s, a.pids, a.sig, !!a.tree);
    case "renice":
      return doRenice(s, a.pid, a.nice);
    case "unit":
      return doUnit(s, a.name, a.op);
    case "startup":
      return doStartup(s, a.name, a.op);
    case "authorize": {
      if (!s.auth) return s;
      if (!a.password) return { ...s, auth: { ...s.auth, failed: true } };
      const authed = { ...s, auth: null, rootUntil: s.uptime + ROOT_CACHE };
      return replay(log(authed, { tone: "info", text: "polkit: authenticated as root", detail: "Cached for 5 minutes (auth_admin_keep)." }), s.auth.pending);
    }
    case "cancelAuth":
      return s.auth ? log({ ...s, auth: null }, { tone: "warn", text: `Not authorised: ${s.auth.command}`, detail: "Authentication was dismissed." }) : s;
    case "dropRoot":
      return log({ ...s, rootUntil: 0 }, { tone: "info", text: "Dropped root authorisation." });
    case "clearLog":
      return { ...s, log: [] };
    case "reset":
      return initTM();
  }
}

export const isEnabled = (s: TM, key: string, fallback: boolean) => s.enabled[key] ?? fallback;
