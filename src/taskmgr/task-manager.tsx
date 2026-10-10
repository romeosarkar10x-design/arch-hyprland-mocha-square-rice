import { useEffect, useReducer, useState, type CSSProperties } from "react";
import { Button, Icon, IconButton, type IconName } from "../ui";
import { PolkitPrompt } from "../shell/polkit-prompt";
import { usePropState } from "../use-prop-state";
import { ConfirmDialog, needsConfirm, ReniceDialog, SignalDialog, type Ask } from "./dialogs";
import { MACHINE, ME } from "./demo";
import { PerformancePage } from "./performance-page";
import { ProcessesPage, type ProcView } from "./processes-page";
import { ServicesPage, StartupPage, UsersPage } from "./pages";
import { fmtDuration, fmtKiB, summarise } from "./procs";
import { initTM, isRoot, reducer, type LogEntry } from "./store";
import "./taskmgr.css";

export type Page = "processes" | "performance" | "users" | "services" | "startup";

const PAGES: { id: Page; label: string; icon: IconName }[] = [
  { id: "processes", label: "Processes", icon: "app" },
  { id: "performance", label: "Performance", icon: "chart" },
  { id: "users", label: "Users", icon: "account" },
  { id: "services", label: "Services", icon: "settings" },
  { id: "startup", label: "Startup", icon: "power" },
];

export interface TaskManagerProps {
  page?: Page;
  /** Milliseconds between refreshes; 0 pauses. */
  interval?: number;
  /** Initial Processes view (mode, grouping, clubbing, memory metric, columns…). */
  view?: Partial<ProcView>;
  /** Process selected on open. */
  selected?: number;
  /** Open the properties panel for the selected process. */
  details?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
}

type Dialog = { kind: "signal"; pids: number[]; sig?: number } | { kind: "renice"; pid: number } | { kind: "confirm"; pids: number[]; sig: number; tree: boolean };

const TONE_ICON: Record<LogEntry["tone"], IconName> = { ok: "checkCircle", info: "info", warn: "alert", err: "alert" };

/**
 * A Linux task manager: process tree with clubbed children, grouping, per-process
 * memory (USS / PSS / RSS), every signal with real semantics, renice, systemd units,
 * startup entries, users and live performance graphs. Simulated, so nothing real dies.
 */
export function TaskManager({ page: initialPage = "processes", interval: initialInterval = 1000, view, selected, details, width = "100%", height = 760, className }: TaskManagerProps) {
  const [tm, dispatch] = useReducer(reducer, undefined, () => initTM());
  const [page, setPage] = usePropState<Page>(initialPage);
  const [interval, setIntervalMs] = usePropState(initialInterval);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [focus, setFocus] = useState(selected === undefined ? undefined : { pid: selected, n: 0 });
  const [logOpen, setLogOpen] = useState(false);
  const [seen, setSeen] = useState(0);

  useEffect(() => {
    if (!interval) return;
    const id = window.setInterval(() => dispatch({ type: "tick", dt: interval / 1000, seed: Math.floor(Math.random() * 2 ** 31) }), interval);
    return () => window.clearInterval(id);
  }, [interval]);

  const ask: Ask = {
    signal: (pids, sig) => pids.length && setDialog({ kind: "signal", pids, sig }),
    renice: (pid) => setDialog({ kind: "renice", pid }),
    send: (pids, sig, tree = false) => {
      if (!pids.length) return;
      if (!skipConfirm && needsConfirm(tm.procs, pids, sig, tree)) setDialog({ kind: "confirm", pids, sig, tree });
      else dispatch({ type: "signal", pids, sig, tree });
    },
    goto: (pid) => {
      setPage("processes");
      setFocus((f) => ({ pid, n: (f?.n ?? 0) + 1 }));
    },
  };

  const sum = summarise(tm.procs, MACHINE, tm.load);
  const root = isRoot(tm);
  const latest = tm.log[0];
  const notice = latest && latest.id > seen ? latest : undefined;
  const reniceProc = dialog?.kind === "renice" ? tm.procs.find((p) => p.pid === dialog.pid) : undefined;

  return (
    <div className={["rx-tm", className].filter(Boolean).join(" ")} style={{ width, height } as CSSProperties} onKeyDown={(e) => e.key === "Escape" && dialog && setDialog(null)}>
      <header className="rx-tm-title">
        <Icon name="gauge" size={16} className="hx-mauve" />
        <b>Task Manager</b>
        <span className="hx-faint">
          {ME}@{MACHINE.hostname} · {MACHINE.kernel}
        </span>
        <span className="hx-spacer" />
        {root && (
          <span className="rx-tm-rootchip" title="polkit authorisation is cached (auth_admin_keep)">
            <Icon name="lock" size={12} /> root · {fmtDuration(tm.rootUntil - tm.uptime)}
            <button type="button" onClick={() => dispatch({ type: "dropRoot" })} title="Drop root">
              <Icon name="close" size={11} />
            </button>
          </span>
        )}
        <label className="rx-tm-speed">
          <Icon name="timer" size={13} />
          <select className="rx-tm-select" value={interval} onChange={(e) => setIntervalMs(Number(e.target.value))} aria-label="Update speed">
            <option value={500}>0.5 s</option>
            <option value={1000}>1 s</option>
            <option value={2000}>2 s</option>
            <option value={5000}>5 s</option>
            <option value={0}>Paused</option>
          </select>
        </label>
        <IconButton icon={interval ? "pause" : "play"} size="sm" label={interval ? "Pause updates" : "Resume updates"} onClick={() => setIntervalMs(interval ? 0 : 1000)} />
        <IconButton icon="reboot" size="sm" label="Reset the simulation" onClick={() => dispatch({ type: "reset" })} />
      </header>

      <div className="rx-tm-body">
        <nav className="rx-tm-nav" aria-label="Pages">
          {PAGES.map((p) => (
            <button key={p.id} type="button" className={p.id === page ? "is-active" : undefined} aria-current={p.id === page ? "page" : undefined} onClick={() => setPage(p.id)}>
              <Icon name={p.icon} size={16} />
              <span>{p.label}</span>
            </button>
          ))}
          <span className="hx-spacer" />
          <div className="rx-tm-navstat">
            <span>CPU</span>
            <b>{Math.round(sum.cpu)}%</b>
            <span>Memory</span>
            <b>{Math.round((sum.memUsed / MACHINE.memTotal) * 100)}%</b>
          </div>
        </nav>

        <main className="rx-tm-main">
          {notice && (
            <div className={`rx-tm-notice rx-tm-notice--${notice.tone}`} role="status">
              <Icon name={TONE_ICON[notice.tone]} size={14} />
              <div>
                <b>{notice.text}</b>
                {notice.detail && <span>{notice.detail}</span>}
              </div>
              {notice.retry && (
                <Button size="sm" variant="danger" onClick={() => dispatch({ type: "signal", pids: notice.retry!.pids, sig: notice.retry!.sig })}>
                  {notice.retry.label}
                </Button>
              )}
              <IconButton icon="close" size="sm" label="Dismiss" onClick={() => setSeen(notice.id)} />
            </div>
          )}
          {page === "processes" && <ProcessesPage tm={tm} dispatch={dispatch} ask={ask} view={view} focus={focus} details={details} />}
          {page === "performance" && <PerformancePage tm={tm} ask={ask} />}
          {page === "users" && <UsersPage tm={tm} ask={ask} />}
          {page === "services" && <ServicesPage tm={tm} dispatch={dispatch} ask={ask} />}
          {page === "startup" && <StartupPage tm={tm} dispatch={dispatch} />}
        </main>
      </div>

      {logOpen && (
        <section className="rx-tm-log" aria-label="Activity log">
          <header>
            <b>Activity</b>
            <span className="hx-faint">signals, renice, systemctl, polkit</span>
            <span className="hx-spacer" />
            <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "clearLog" })}>
              Clear
            </Button>
          </header>
          <ol>
            {tm.log.map((l) => (
              <li key={l.id} className={`rx-tm-log--${l.tone}`}>
                <time>{fmtDuration(l.at)}</time>
                <Icon name={TONE_ICON[l.tone]} size={12} />
                <b>{l.text}</b>
                {l.detail && <span className="hx-faint">{l.detail}</span>}
              </li>
            ))}
            {!tm.log.length && <li className="hx-faint">Nothing yet. End a task or send a signal.</li>}
          </ol>
        </section>
      )}

      <footer className="rx-tm-status">
        <span>
          Tasks <b>{sum.tasks}</b>, <b>{sum.threads}</b> thr; <b>{sum.running}</b> running
          {sum.stopped > 0 && (
            <>
              , <b className="rx-tm-yellow">{sum.stopped}</b> stopped
            </>
          )}
          {sum.zombie > 0 && (
            <>
              , <b className="rx-tm-red">{sum.zombie}</b> zombie
            </>
          )}
        </span>
        <span>
          Load <b>{tm.load.map((l) => l.toFixed(2)).join(" ")}</b>
        </span>
        <span>
          Up <b>{fmtDuration(tm.uptime)}</b>
        </span>
        <span>
          Mem <b>{fmtKiB(sum.memUsed)}</b> / {fmtKiB(MACHINE.memTotal)}
        </span>
        <span>
          Swap <b>{fmtKiB(sum.swapUsed)}</b> / {fmtKiB(MACHINE.swapTotal)}
        </span>
        <span className="hx-spacer" />
        <button type="button" className={["rx-tm-logbtn", logOpen && "is-on"].filter(Boolean).join(" ")} onClick={() => setLogOpen((o) => !o)}>
          <Icon name="note" size={12} /> Activity ({tm.log.length})
        </button>
      </footer>

      {(dialog || tm.auth) && <div className="rx-tm-scrim" onMouseDown={() => (tm.auth ? dispatch({ type: "cancelAuth" }) : setDialog(null))} />}
      {dialog?.kind === "signal" && (
        <SignalDialog
          procs={tm.procs}
          pids={dialog.pids}
          sig={dialog.sig}
          onClose={() => setDialog(null)}
          onSend={(sig, tree) => {
            setDialog(null);
            ask.send(dialog.pids, sig, tree);
          }}
        />
      )}
      {dialog?.kind === "renice" && reniceProc && (
        <ReniceDialog
          proc={reniceProc}
          as={root ? "root" : ME}
          onClose={() => setDialog(null)}
          onApply={(nice) => {
            setDialog(null);
            dispatch({ type: "renice", pid: reniceProc.pid, nice });
          }}
        />
      )}
      {dialog?.kind === "confirm" && (
        <ConfirmDialog
          procs={tm.procs}
          pids={dialog.pids}
          sig={dialog.sig}
          tree={dialog.tree}
          onSkip={setSkipConfirm}
          onClose={() => setDialog(null)}
          onConfirm={(tree) => {
            setDialog(null);
            dispatch({ type: "signal", pids: dialog.pids, sig: dialog.sig, tree });
          }}
        />
      )}
      {tm.auth && (
        <div className="rx-tm-auth">
          <PolkitPrompt
            key={tm.auth.command}
            command={tm.auth.command}
            action={tm.auth.command.startsWith("systemctl") ? "org.freedesktop.systemd1.manage-units" : "org.freedesktop.policykit.exec"}
            failed={tm.auth.failed}
            onAuthenticate={(password) => dispatch({ type: "authorize", password })}
            onCancel={() => dispatch({ type: "cancelAuth" })}
          />
        </div>
      )}
    </div>
  );
}
