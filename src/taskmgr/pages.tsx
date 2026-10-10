import { useState } from "react";
import { Button, Icon, IconButton, Toggle, cx } from "../ui";
import { ConfigFile } from "../theme/config-file";
import type { Ask } from "./dialogs";
import { MACHINE, ME, STARTUP, UIDS } from "./demo";
import { childMap, fmtCpu, fmtDuration, fmtKiB, mainPid, totals, unitProcs, unitState, type Proc, type Unit, type UnitState } from "./procs";
import { isEnabled, type Action, type TM, type UnitOp } from "./store";
import { cmd, link, page, search, seg, segButton, table, tag, toolbar, tr } from "./styles";

// Dimmed cells size border-box (max-width includes the padding), which keeps description columns at 380px.
const dim = "box-border! text-overlay1";

// ───────── Users ─────────

export function UsersPage({ tm, ask }: { tm: TM; ask: Ask }) {
  const [open, setOpen] = useState<string | null>(ME);
  const users = new Map<string, Proc[]>();
  for (const p of tm.procs) if (!p.kernel) users.set(p.user, [...(users.get(p.user) ?? []), p]);
  const list = [...users].map(([user, ps]) => ({ user, ps, t: totals(ps, "pss") })).sort((a, b) => b.t.mem - a.t.mem);
  return (
    <div data-component="UsersPage" className={page}>
      <table className={table}>
        <thead>
          <tr>
            <th>User</th>
            <th>UID</th>
            <th>Session</th>
            <th className="text-right">Processes</th>
            <th className="text-right">Threads</th>
            <th className="text-right">CPU</th>
            <th className="text-right">Memory (PSS)</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {list.map(({ user, ps, t }) => (
            <UserRows key={user} user={user} ps={ps} t={t} open={open === user} onToggle={() => setOpen(open === user ? null : user)} ask={ask} />
          ))}
        </tbody>
      </table>
      <p className="m-0 px-3.5 py-2.5 text-[11.5px] text-overlay1">
        Kernel threads ({tm.procs.filter((p) => p.kernel).length}) aren't listed. Ending another user's processes needs authentication; ending all of {ME}'s ends the Hyprland session.
      </p>
    </div>
  );
}

function UserRows({ user, ps, t, open, onToggle, ask }: { user: string; ps: Proc[]; t: ReturnType<typeof totals>; open: boolean; onToggle: () => void; ask: Ask }) {
  const session = user === ME ? "seat0 · tty1 · session 2 (Hyprland, wayland)" : user === "root" ? "system" : "service account";
  return (
    <>
      <tr data-component="UserRows" className={tr(open)} onClick={onToggle}>
        <td>
          <Icon name={open ? "down" : "chevronRight"} size={11} /> <Icon name={user === "root" ? "lock" : "account"} size={14} /> <b>{user}</b>
        </td>
        <td>{UIDS[user] ?? "?"}</td>
        <td className={dim}>{session}</td>
        <td className="text-right">{t.count}</td>
        <td className="text-right">{t.threads}</td>
        <td className="text-right">{fmtCpu(t.cpu / MACHINE.threads)}%</td>
        <td className="text-right">{fmtKiB(t.mem)}</td>
        <td className="text-right" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" icon="close" onClick={() => ask.send(ps.map((p) => p.pid), 15)}>
            End all
          </Button>
        </td>
      </tr>
      {open &&
        [...ps].sort((a, b) => b.pss - a.pss).map((p) => (
          <tr key={p.pid} className={cx(tr(), "text-[12px] *:h-[26px]! *:first:pl-10!")}>
            <td>
              <button type="button" className={link} onClick={() => ask.goto(p.pid)}>
                {p.name}
              </button>
            </td>
            <td className={dim}>{p.pid}</td>
            <td className={cx(dim, cmd)}>{p.cmd}</td>
            <td />
            <td className="text-right">{p.threads}</td>
            <td className="text-right">{fmtCpu(p.cpu / MACHINE.threads)}%</td>
            <td className="text-right">{fmtKiB(p.pss)}</td>
            <td className="text-right">
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
    <div data-component="ServicesPage" className={page}>
      <div className={toolbar}>
        <label className={search}>
          <Icon name="search" size={14} />
          <input value={query} placeholder="Filter units…" onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className={seg} role="radiogroup" aria-label="Scope">
          {(["all", "system", "user"] as const).map((s) => (
            <button key={s} type="button" role="radio" aria-checked={scope === s} className={segButton} onClick={() => setScope(s)}>
              {s === "all" ? "All" : s === "system" ? "System" : "User (--user)"}
            </button>
          ))}
        </div>
        <div className={seg} role="radiogroup" aria-label="State">
          {(["all", "running", "exited", "failed", "inactive"] as const).map((s) => (
            <button key={s} type="button" role="radio" aria-checked={filter === s} className={segButton} onClick={() => setFilter(s)}>
              {s}
              {s !== "all" && <small> {counts(s)}</small>}
            </button>
          ))}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto]">
        <div className="min-h-0 overflow-auto">
          <table className={table}>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Description</th>
                <th>State</th>
                <th className="text-right">Main PID</th>
                <th className="text-right">Tasks</th>
                <th className="text-right">Memory</th>
                <th>Enabled</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ u, state, procs }) => {
                const pid = mainPid(tm.procs, u);
                const enabled = isEnabled(tm, `unit:${u.name}`, u.enabled);
                return (
                  <tr key={`${u.scope}:${u.name}`} className={tr(cur === u)} onClick={() => setSel(u.name)}>
                    <td>
                      <b>{u.name}</b> {u.scope === "user" && <span className={tag()}>user</span>}
                    </td>
                    <td className={dim}>{u.description}</td>
                    <td>
                      <span className="text-[11px]" style={{ color: `var(--hx-${STATE_TONE[state]})` }}>●</span> {state === "running" ? "active (running)" : state === "exited" ? "active (exited)" : state}
                    </td>
                    <td className="text-right">
                      {pid !== undefined ? (
                        <button type="button" className={link} onClick={(e) => (e.stopPropagation(), ask.goto(pid))}>
                          {pid}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-right">{procs.length || "—"}</td>
                    <td className="text-right">{procs.length ? fmtKiB(totals(procs, "pss").mem) : "—"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Toggle checked={enabled} onChange={(on) => op(u, on ? "enable" : "disable")} accent="green" />
                    </td>
                    <td className="flex h-8 items-center justify-end gap-0.5 text-right" onClick={(e) => e.stopPropagation()}>
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
    <div data-component="UnitStatus" className="max-h-[241px] overflow-auto border-t border-surface0 bg-crust">
      <header className="caps px-3.5 pt-2">
        {u.scope === "user" ? "systemctl --user status" : "systemctl status"} {u.name}
      </header>
      <pre className="m-0 px-3.5 pt-2 pb-3 font-[inherit] text-[11.5px] leading-[1.55] whitespace-pre text-subtext0">{text}</pre>
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
    <div data-component="StartupPage" className={cx(page, "gap-3.5 pb-3.5")}>
      <table className={table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Command</th>
            <th>Started by</th>
            <th>Status</th>
            <th className="text-right">Memory</th>
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
              <tr key={e.name} className={tr()}>
                <td>
                  <b>{e.name}</b>
                </td>
                <td className={cmd}>{e.command}</td>
                <td className={dim}>hyprland.lua · exec_cmd</td>
                <td>{!e.match ? <span className="text-overlay1">one-shot</span> : ps.length ? <span className="text-green">running · PID {ps[0]!.pid}</span> : <span className="text-overlay1">not running</span>}</td>
                <td className="text-right">{mem ? fmtKiB(mem) : "—"}</td>
                <td>{impact(mem)}</td>
                <td>
                  <Toggle checked={on} onChange={(v) => dispatch({ type: "startup", name: e.name, op: v ? "enable" : "disable" })} accent="green" />
                </td>
                <td className="text-right">
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
              <tr key={u.name} className={tr()}>
                <td>
                  <b>{u.name.replace(/\.service$/, "")}</b>
                </td>
                <td className={cmd}>{u.template[0]?.cmd ?? "—"}</td>
                <td className={dim}>systemd --user · default.target</td>
                <td>{ps.length ? <span className="text-green">running · PID {mainPid(tm.procs, u)}</span> : <span className="text-overlay1">not running</span>}</td>
                <td className="text-right">{mem ? fmtKiB(mem) : "—"}</td>
                <td>{impact(mem)}</td>
                <td>
                  <Toggle checked={on} onChange={(v) => dispatch({ type: "unit", name: u.name, op: v ? "enable" : "disable" })} accent="green" />
                </td>
                <td className="text-right">
                  <Button size="sm" variant="ghost" icon="play" disabled={ps.length > 0} onClick={() => dispatch({ type: "unit", name: u.name, op: "start" })}>
                    Start
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ConfigFile file="~/.config/hypr/hyprland.lua  (AUTOSTART)" text={lua} maxHeight={220} className="mx-3.5" />
    </div>
  );
}
