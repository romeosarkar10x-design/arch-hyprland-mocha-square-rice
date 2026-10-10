import { useEffect, useReducer, useState, type CSSProperties } from "react";
import { Button, Icon, IconButton, cx, type IconName } from "../ui";
import { PolkitPrompt } from "../shell/polkit-prompt";
import { usePropState } from "../use-prop-state";
import { ConfirmDialog, needsConfirm, ReniceDialog, SignalDialog, type Ask } from "./dialogs";
import { MACHINE, ME } from "./demo";
import { PerformancePage } from "./performance-page";
import { ProcessesPage, type ProcView } from "./processes-page";
import { ServicesPage, StartupPage, UsersPage } from "./pages";
import { fmtDuration, fmtKiB, summarise } from "./procs";
import { initTM, isRoot, reducer, type LogEntry, type TM } from "./store";
import { select } from "./styles";

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
const TONE_TEXT: Record<LogEntry["tone"], string> = { ok: "text-green", info: "text-blue", warn: "text-yellow", err: "text-red" };
const TONE_VAR: Record<LogEntry["tone"], string> = { ok: "var(--hx-green)", info: "var(--hx-blue)", warn: "var(--hx-yellow)", err: "var(--hx-red)" };

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
    <div
      data-component="TaskManager"
      className={cx(
        "relative flex min-h-0 flex-col overflow-hidden bg-base font-hx text-[12.5px] text-text shadow-[0_0_0_1px_var(--hx-surface0),var(--hx-shadow-window)]",
        // Kit buttons take the window's type and colour, so toolbars read as one dense strip.
        "[&_:is([data-component~=Button],[data-component~=IconButton])]:[font:inherit] [&_:is([data-component~=Button],[data-component~=IconButton])]:text-inherit",
        className,
      )}
      style={{ width, height } as CSSProperties}
      onKeyDown={(e) => e.key === "Escape" && dialog && setDialog(null)}
    >
      <TitleBar
        rootLeft={root ? tm.rootUntil - tm.uptime : null}
        onDropRoot={() => dispatch({ type: "dropRoot" })}
        interval={interval}
        onInterval={setIntervalMs}
        onReset={() => dispatch({ type: "reset" })}
      />

      <div className="flex min-h-0 flex-1">
        <PageNav page={page} onPage={setPage} cpu={sum.cpu} mem={sum.memUsed / MACHINE.memTotal} />

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {notice && (
            <Notice
              entry={notice}
              onRetry={notice.retry && (() => dispatch({ type: "signal", pids: notice.retry!.pids, sig: notice.retry!.sig }))}
              onDismiss={() => setSeen(notice.id)}
            />
          )}
          {page === "processes" && <ProcessesPage tm={tm} dispatch={dispatch} ask={ask} view={view} focus={focus} details={details} />}
          {page === "performance" && <PerformancePage tm={tm} ask={ask} />}
          {page === "users" && <UsersPage tm={tm} ask={ask} />}
          {page === "services" && <ServicesPage tm={tm} dispatch={dispatch} ask={ask} />}
          {page === "startup" && <StartupPage tm={tm} dispatch={dispatch} />}
        </main>
      </div>

      {logOpen && <ActivityLog log={tm.log} onClear={() => dispatch({ type: "clearLog" })} />}

      <StatusBar tm={tm} sum={sum} logOpen={logOpen} onLog={() => setLogOpen((o) => !o)} />

      {(dialog || tm.auth) && (
        <div
          className="absolute inset-0 z-40 animate-[hx-fade_var(--hx-fast)_ease_both] bg-crust/55 backdrop-blur-[3px]"
         onMouseDown={() => (tm.auth ? dispatch({ type: "cancelAuth" }) : setDialog(null))}
        />
      )}
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
        <div className="pointer-events-none absolute inset-0 z-42 grid place-items-center *:pointer-events-auto">
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

function TitleBar({ rootLeft, onDropRoot, interval, onInterval, onReset }: { rootLeft: number | null; onDropRoot: () => void; interval: number; onInterval: (ms: number) => void; onReset: () => void }) {
  return (
    <header data-component="TitleBar" className="flex h-[39px] flex-none items-center gap-2.5 border-b border-surface0 bg-mantle pr-2.5 pl-3.5">
      <Icon name="gauge" size={16} className="text-mauve" />
      <b className="text-[13px]">Task Manager</b>
      <span className="text-overlay1">
        {ME}@{MACHINE.hostname} · {MACHINE.kernel}
      </span>
      <span className="flex-1" />
      {rootLeft !== null && (
        <span className="inline-flex h-6 items-center gap-1.5 bg-red/18 pr-1 pl-2 text-[11.5px] font-bold text-red" title="polkit authorisation is cached (auth_admin_keep)">
          <Icon name="lock" size={12} /> root · {fmtDuration(rootLeft)}
          <button type="button" className="unbutton grid size-[18px] cursor-pointer place-items-center" onClick={onDropRoot} title="Drop root">
            <Icon name="close" size={11} />
          </button>
        </span>
      )}
      <label className="inline-flex items-center gap-1.5 text-overlay1">
        <Icon name="timer" size={13} />
        <select className={select} value={interval} onChange={(e) => onInterval(Number(e.target.value))} aria-label="Update speed">
          <option value={500}>0.5 s</option>
          <option value={1000}>1 s</option>
          <option value={2000}>2 s</option>
          <option value={5000}>5 s</option>
          <option value={0}>Paused</option>
        </select>
      </label>
      <IconButton icon={interval ? "pause" : "play"} size="sm" label={interval ? "Pause updates" : "Resume updates"} onClick={() => onInterval(interval ? 0 : 1000)} />
      <IconButton icon="reboot" size="sm" label="Reset the simulation" onClick={onReset} />
    </header>
  );
}

function PageNav({ page, onPage, cpu, mem }: { page: Page; onPage: (p: Page) => void; cpu: number; mem: number }) {
  return (
    <nav data-component="PageNav" className="flex w-[181px] flex-none flex-col gap-0.5 border-r border-surface0 bg-mantle px-1.5 py-2" aria-label="Pages">
      {PAGES.map((p) => (
        <button
          key={p.id}
          type="button"
          className={cx(
            "unbutton relative flex h-[34px] cursor-pointer items-center gap-2.5 px-3 text-left text-subtext0 hover:bg-surface0 hover:text-text",
            p.id === page && "bg-surface0 font-bold text-text before:absolute before:inset-y-[7px] before:left-0 before:w-[3px] before:bg-mauve",
          )}
          aria-current={p.id === page ? "page" : undefined}
          onClick={() => onPage(p.id)}
        >
          <Icon name={p.icon} size={16} />
          <span>{p.label}</span>
        </button>
      ))}
      <span className="flex-1" />
      <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-0.5 border-t border-surface0 px-3 py-2.5 text-[11.5px] text-overlay1 [&_b]:text-right [&_b]:text-text">
        <span>CPU</span>
        <b>{Math.round(cpu)}%</b>
        <span>Memory</span>
        <b>{Math.round(mem * 100)}%</b>
      </div>
    </nav>
  );
}

/** The latest log entry, until dismissed. */
function Notice({ entry, onRetry, onDismiss }: { entry: LogEntry; onRetry?: () => void; onDismiss: () => void }) {
  return (
    <div
      data-component="Notice"
      role="status"
      className="flex flex-none animate-[rx-tm-drop_var(--hx-med)_var(--hx-ease)_both] items-center gap-2.5 border-b border-l-3 border-b-surface0 border-l-(--rx-tone) bg-[color-mix(in_srgb,var(--rx-tone)_9%,var(--hx-base))] py-[7px] pr-2.5 pl-3"
      style={{ "--rx-tone": TONE_VAR[entry.tone] } as CSSProperties}
    >
      <Icon name={TONE_ICON[entry.tone]} size={14} className="flex-none text-(--rx-tone)" />
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <b>{entry.text}</b>
        {entry.detail && <span className="text-[12px] text-subtext0">{entry.detail}</span>}
      </div>
      {entry.retry && (
        <Button size="sm" variant="danger" onClick={onRetry}>
          {entry.retry.label}
        </Button>
      )}
      <IconButton icon="close" size="sm" label="Dismiss" onClick={onDismiss} />
    </div>
  );
}

function ActivityLog({ log, onClear }: { log: LogEntry[]; onClear: () => void }) {
  return (
    <section data-component="ActivityLog" className="flex max-h-[201px] flex-none flex-col border-t border-surface0 bg-mantle" aria-label="Activity log">
      <header className="flex items-center gap-2.5 border-b border-surface0 px-2.5 py-1">
        <b>Activity</b>
        <span className="text-overlay1">signals, renice, systemctl, polkit</span>
        <span className="flex-1" />
        <Button size="sm" variant="ghost" onClick={onClear}>
          Clear
        </Button>
      </header>
      <ol className="m-0 list-none overflow-auto px-0 py-1">
        {log.map((l) => (
          <li key={l.id} className="flex items-baseline gap-2 px-2.5 py-0.5 text-[11.5px]">
            <time className="text-overlay0 tabular-nums">{fmtDuration(l.at)}</time>
            <Icon name={TONE_ICON[l.tone]} size={12} className={TONE_TEXT[l.tone]} />
            <b>{l.text}</b>
            {l.detail && <span className="truncate text-overlay1">{l.detail}</span>}
          </li>
        ))}
        {!log.length && <li className="flex items-baseline gap-2 px-2.5 py-0.5 text-[11.5px] text-overlay1">Nothing yet. End a task or send a signal.</li>}
      </ol>
    </section>
  );
}

function StatusBar({ tm, sum, logOpen, onLog }: { tm: TM; sum: ReturnType<typeof summarise>; logOpen: boolean; onLog: () => void }) {
  return (
    <footer
      data-component="StatusBar"
      className="flex h-[27px] flex-none items-center gap-4 overflow-hidden border-t border-surface0 bg-mantle pl-3 text-[11.5px] whitespace-nowrap text-overlay1 tabular-nums [&_b]:font-normal [&_b]:text-text"
    >
      <span>
        Tasks <b>{sum.tasks}</b>, <b>{sum.threads}</b> thr; <b>{sum.running}</b> running
        {sum.stopped > 0 && (
          <>
            , <b className="text-yellow!">{sum.stopped}</b> stopped
          </>
        )}
        {sum.zombie > 0 && (
          <>
            , <b className="text-red!">{sum.zombie}</b> zombie
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
      <span className="flex-1" />
      <button
        type="button"
        className={cx(
          "unbutton inline-flex h-full cursor-pointer items-center gap-1.5 border-l border-surface0 px-3 text-subtext0 hover:bg-surface0 hover:text-text",
          logOpen && "bg-surface0 text-text",
        )}
        onClick={onLog}
      >
        <Icon name="note" size={12} /> Activity ({tm.log.length})
      </button>
    </footer>
  );
}
