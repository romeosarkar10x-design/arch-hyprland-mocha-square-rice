import { useState } from "react";
import { Button, Icon, IconButton, Toggle } from "../ds";
import { ConfigFile } from "../theme/ConfigFile";
import type { Ask } from "./dialogs";
import { MACHINE, ME, STARTUP, UIDS } from "./demo";
import { childMap, fmtCpu, fmtDuration, fmtKiB, mainPid, totals, unitProcs, unitState, type Proc, type Unit, type UnitState } from "./procs";
import { isEnabled, type Action, type TM, type UnitOp } from "./store";

// ───────── Users ─────────

export function UsersPage({ tm, ask }: { tm: TM; ask: Ask }) {
  const [open, setOpen] = useState<string | null>(ME);
  const users = new Map<string, Proc[]>();
  for (const p of tm.procs) if (!p.kernel) users.set(p.user, [...(users.get(p.user) ?? []), p]);
  const list = [...users].map(([user, ps]) => ({ user, ps, t: totals(ps, "pss") })).sort((a, b) => b.t.mem - a.t.mem);
  return (
    <div className="rx-tm-page">
      <table className="rx-tm-tbl">
        <thead>
          <tr>
            <th>User</th>
            <th>UID</th>
            <th>Session</th>
            <th className="is-right">Processes</th>
            <th className="is-right">Threads</th>
            <th className="is-right">CPU</th>
            <th className="is-right">Memory (PSS)</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {list.map(({ user, ps, t }) => (
            <UserRows key={user} user={user} ps={ps} t={t} open={open === user} onToggle={() => setOpen(open === user ? null : user)} ask={ask} />
          ))}
        </tbody>
      </table>
      <p className="hx-faint rx-tm-note">
        Kernel threads ({tm.procs.filter((p) => p.kernel).length}) aren't listed. Ending another user's processes needs authentication; ending all of {ME}'s ends the Hyprland session.
      </p>
    </div>
  );
}

function UserRows({ user, ps, t, open, onToggle, ask }: { user: string; ps: Proc[]; t: ReturnType<typeof totals>; open: boolean; onToggle: () => void; ask: Ask }) {
  const session = user === ME ? "seat0 · tty1 · session 2 (Hyprland, wayland)" : user === "root" ? "system" : "service account";
  return (
    <>
      <tr className={["rx-tm-tr", open && "is-open"].filter(Boolean).join(" ")} onClick={onToggle}>
        <td>
          <Icon name={open ? "down" : "chevronRight"} size={11} /> <Icon name={user === "root" ? "lock" : "account"} size={14} /> <b>{user}</b>
        </td>
        <td>{UIDS[user] ?? "?"}</td>
        <td className="hx-faint">{session}</td>
        <td className="is-right">{t.count}</td>
        <td className="is-right">{t.threads}</td>
        <td className="is-right">{fmtCpu(t.cpu / MACHINE.threads)}%</td>
        <td className="is-right">{fmtKiB(t.mem)}</td>
        <td className="is-right" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" icon="close" onClick={() => ask.send(ps.map((p) => p.pid), 15)}>
            End all
          </Button>
        </td>
      </tr>
      {open &&
        [...ps].sort((a, b) => b.pss - a.pss).map((p) => (
          <tr key={p.pid} className="rx-tm-tr rx-tm-tr--sub">
            <td>
              <button type="button" className="rx-tm-link" onClick={() => ask.goto(p.pid)}>
                {p.name}
              </button>
            </td>
            <td className="hx-faint">{p.pid}</td>
            <td className="hx-faint rx-tm-cmd">{p.cmd}</td>
            <td />
            <td className="is-right">{p.threads}</td>
            <td className="is-right">{fmtCpu(p.cpu / MACHINE.threads)}%</td>
            <td className="is-right">{fmtKiB(p.pss)}</td>
            <td className="is-right">
              <IconButton icon="close" size="sm" label={`End ${p.name}`} onClick={() => ask.send([p.pid], 15)} />
            </td>
          </tr>
        ))}
    </>
  );
}

// ───────── Services ─────────

const STATE_TONE: Record<UnitState, string> = { running: "green", exited: "blue", failed: "red", inactive: "overlay0" };

export function ServicesPage({ tm, dispatch, ask }: { tm: TM; dispatch: (a: Action) => void; ask: Ask }) {
  const [scope, setScope] = useState<"all" | "system" | "user">("all");
  const [filter, setFilter] = useState<"all" | UnitState>("all");
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState("sshd.service");
  const rows = tm.units
    .map((u) => ({ u, state: unitState(tm.procs, u, tm.unitResult), procs: unitProcs(tm.procs, u) }))
    .filter((r) => (scope === "all" || r.u.scope === scope) && (filter === "all" || r.state === filter) && `${r.u.name} ${r.u.description}`.toLowerCase().includes(query.toLowerCase()));
  const cur = tm.units.find((u) => u.name === sel && (scope === "all" || u.scope === scope)) ?? rows[0]?.u;
  const op = (u: Unit, o: UnitOp) => dispatch({ type: "unit", name: u.name, op: o });
  const counts = (s: UnitState) => tm.units.filter((u) => unitState(tm.procs, u, tm.unitResult) === s).length;
  return (
    <div className="rx-tm-page rx-tm-services">
      <div className="rx-tm-toolbar">
        <label className="rx-tm-search">
          <Icon name="search" size={14} />
          <input value={query} placeholder="Filter units…" onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="rx-tm-seg" role="radiogroup" aria-label="Scope">
          {(["all", "system", "user"] as const).map((s) => (
            <button key={s} type="button" role="radio" aria-checked={scope === s} className={scope === s ? "is-active" : undefined} onClick={() => setScope(s)}>
              {s === "all" ? "All" : s === "system" ? "System" : "User (--user)"}
            </button>
          ))}
        </div>
        <div className="rx-tm-seg" role="radiogroup" aria-label="State">
          {(["all", "running", "exited", "failed", "inactive"] as const).map((s) => (
            <button key={s} type="button" role="radio" aria-checked={filter === s} className={filter === s ? "is-active" : undefined} onClick={() => setFilter(s)}>
              {s}
              {s !== "all" && <small> {counts(s)}</small>}
            </button>
          ))}
        </div>
      </div>
      <div className="rx-tm-svc-split">
        <div className="rx-tm-scroll">
          <table className="rx-tm-tbl">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Description</th>
                <th>State</th>
                <th className="is-right">Main PID</th>
                <th className="is-right">Tasks</th>
                <th className="is-right">Memory</th>
                <th>Enabled</th>
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ u, state, procs }) => {
                const pid = mainPid(tm.procs, u);
                const enabled = isEnabled(tm, `unit:${u.name}`, u.enabled);
                return (
                  <tr key={`${u.scope}:${u.name}`} className={["rx-tm-tr", cur === u && "is-sel"].filter(Boolean).join(" ")} onClick={() => setSel(u.name)}>
                    <td>
                      <b>{u.name}</b> {u.scope === "user" && <span className="rx-tm-tag">user</span>}
                    </td>
                    <td className="hx-faint">{u.description}</td>
                    <td>
                      <span className="rx-tm-dot" style={{ color: `var(--hx-${STATE_TONE[state]})` }}>●</span> {state === "running" ? "active (running)" : state === "exited" ? "active (exited)" : state}
                    </td>
                    <td className="is-right">
                      {pid !== undefined ? (
                        <button type="button" className="rx-tm-link" onClick={(e) => (e.stopPropagation(), ask.goto(pid))}>
                          {pid}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="is-right">{procs.length || "—"}</td>
                    <td className="is-right">{procs.length ? fmtKiB(totals(procs, "pss").mem) : "—"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Toggle checked={enabled} onChange={(on) => op(u, on ? "enable" : "disable")} accent="green" />
                    </td>
                    <td className="is-right rx-tm-actions" onClick={(e) => e.stopPropagation()}>
                      <IconButton icon="play" size="sm" label={`Start ${u.name}`} disabled={state === "running"} onClick={() => op(u, "start")} />
                      <IconButton icon="power" size="sm" label={`Stop ${u.name}`} disabled={state !== "running"} onClick={() => op(u, "stop")} />
                      <IconButton icon="reboot" size="sm" label={`Restart ${u.name}`} onClick={() => op(u, "restart")} />
                      <IconButton icon="repeat" size="sm" label={`Reload ${u.name}`} disabled={!u.reload || state !== "running"} onClick={() => op(u, "reload")} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {cur && <UnitStatus tm={tm} u={cur} />}
      </div>
    </div>
  );
}

/** `systemctl status` for a unit, with the cgroup's process tree. */
function UnitStatus({ tm, u }: { tm: TM; u: Unit }) {
  const state = unitState(tm.procs, u, tm.unitResult);
  const procs = unitProcs(tm.procs, u);
  const pid = mainPid(tm.procs, u);
  const main = procs.find((p) => p.pid === pid);
  const enabled = isEnabled(tm, `unit:${u.name}`, u.enabled);
  const path = u.scope === "system" ? `/usr/lib/systemd/system/${u.name}` : `/usr/lib/systemd/user/${u.name}`;
  const kids = childMap(procs);
  const ids = new Set(procs.map((p) => p.pid));
  const lines: string[] = [];
  const walk = (p: Proc, prefix: string, last: boolean) => {
    lines.push(`${prefix}${last ? "└─" : "├─"}${p.pid} "${p.cmd}"`);
    const cs = kids.get(p.pid) ?? [];
    cs.forEach((c, i) => walk(c, prefix + (last ? "  " : "│ "), i === cs.length - 1));
  };
  const roots = procs.filter((p) => !ids.has(p.ppid));
  roots.forEach((r, i) => walk(r, "             ", i === roots.length - 1));
  const since = main ? fmtDuration(tm.uptime - main.start) : "";
  const active =
    state === "running" ? `active (running) since boot +${fmtDuration(main?.start ?? 0)}; ${since} ago`
    : state === "exited" ? "active (exited)"
    : state === "failed" ? "failed (Result: exit-code)"
    : "inactive (dead)";
  const text = [
    `${state === "failed" ? "×" : "●"} ${u.name} - ${u.description}`,
    `     Loaded: loaded (${path}; ${enabled ? "enabled" : "disabled"}; preset: disabled)`,
    `     Active: ${active}`,
    ...(main ? [`   Main PID: ${main.pid} (${main.name})`] : []),
    ...(procs.length ? [`      Tasks: ${totals(procs, "pss").threads} (limit: 37933)`, `     Memory: ${fmtKiB(totals(procs, "pss").rss)}`, `        CPU: ${procs.reduce((n, p) => n + p.cputime, 0).toFixed(3)}s`, `     CGroup: /${u.scope === "system" ? "system.slice/" : "user.slice/user-1000.slice/user@1000.service/…/"}${u.name}`, ...lines] : []),
    ...(state === "failed" && u.failure ? ["", `${u.name}: ${u.failure}`] : []),
  ].join("\n");
  return (
    <div className="rx-tm-unitstatus">
      <header className="hx-caps">
        {u.scope === "user" ? "systemctl --user status" : "systemctl status"} {u.name}
      </header>
      <pre>{text}</pre>
    </div>
  );
}

// ───────── Startup ─────────

export function StartupPage({ tm, dispatch }: { tm: TM; dispatch: (a: Action) => void }) {
  const userUnits = tm.units.filter((u) => u.scope === "user");
  const impact = (kib: number) => (kib === 0 ? "—" : kib < 50 * 1024 ? "Low" : kib < 200 * 1024 ? "Medium" : "High");
  const lua = [
    "-- See https://wiki.hypr.land/Configuring/Basics/Autostart/",
    'hl.on("hyprland.start", function()',
    ...STARTUP.map((e) => `    ${isEnabled(tm, `startup:${e.name}`, e.enabled) ? "" : "-- "}hl.exec_cmd("${e.command}")`),
    "end)",
  ].join("\n");
  return (
    <div className="rx-tm-page rx-tm-startup">
      <table className="rx-tm-tbl">
        <thead>
          <tr>
            <th>Name</th>
            <th>Command</th>
            <th>Started by</th>
            <th>Status</th>
            <th className="is-right">Memory</th>
            <th>Impact</th>
            <th>Enabled</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {STARTUP.map((e) => {
            const ps = e.match ? tm.procs.filter((p) => p.name === e.match) : [];
            const mem = totals(ps, "pss").mem;
            const on = isEnabled(tm, `startup:${e.name}`, e.enabled);
            return (
              <tr key={e.name} className="rx-tm-tr">
                <td>
                  <b>{e.name}</b>
                </td>
                <td className="rx-tm-cmd">{e.command}</td>
                <td className="hx-faint">hyprland.lua · exec_cmd</td>
                <td>{!e.match ? <span className="hx-faint">one-shot</span> : ps.length ? <span className="rx-tm-ok">running · PID {ps[0]!.pid}</span> : <span className="hx-faint">not running</span>}</td>
                <td className="is-right">{mem ? fmtKiB(mem) : "—"}</td>
                <td>{impact(mem)}</td>
                <td>
                  <Toggle checked={on} onChange={(v) => dispatch({ type: "startup", name: e.name, op: v ? "enable" : "disable" })} accent="green" />
                </td>
                <td className="is-right">
                  <Button size="sm" variant="ghost" icon="play" disabled={ps.length > 0} onClick={() => dispatch({ type: "startup", name: e.name, op: "run" })}>
                    Run now
                  </Button>
                </td>
              </tr>
            );
          })}
          {userUnits.map((u) => {
            const ps = unitProcs(tm.procs, u);
            const mem = totals(ps, "pss").mem;
            const on = isEnabled(tm, `unit:${u.name}`, u.enabled);
            return (
              <tr key={u.name} className="rx-tm-tr">
                <td>
                  <b>{u.name.replace(/\.service$/, "")}</b>
                </td>
                <td className="rx-tm-cmd">{u.template[0]?.cmd ?? "—"}</td>
                <td className="hx-faint">systemd --user · default.target</td>
                <td>{ps.length ? <span className="rx-tm-ok">running · PID {mainPid(tm.procs, u)}</span> : <span className="hx-faint">not running</span>}</td>
                <td className="is-right">{mem ? fmtKiB(mem) : "—"}</td>
                <td>{impact(mem)}</td>
                <td>
                  <Toggle checked={on} onChange={(v) => dispatch({ type: "unit", name: u.name, op: v ? "enable" : "disable" })} accent="green" />
                </td>
                <td className="is-right">
                  <Button size="sm" variant="ghost" icon="play" disabled={ps.length > 0} onClick={() => dispatch({ type: "unit", name: u.name, op: "start" })}>
                    Start
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ConfigFile file="~/.config/hypr/hyprland.lua  (AUTOSTART)" text={lua} maxHeight={220} />
    </div>
  );
}
