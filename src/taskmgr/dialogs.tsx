import { useState, type KeyboardEvent } from "react";
import { Button, Icon, Kbd, cx } from "../ui";
import { ME } from "./demo";
import { PRIORITIES, SIGNALS, descendants, sendSignal, signalByNum, type Proc } from "./procs";
import { check, dialog, dialogFooter, dialogHeader, tag } from "./styles";

/** What pages can ask the shell for: dialogs and confirmed signal delivery. */
export interface Ask {
  /** Open the signal picker for these processes. */
  signal: (pids: number[], sig?: number) => void;
  /** Send now, confirming first when it's destructive. */
  send: (pids: number[], sig: number, tree?: boolean) => void;
  renice: (pid: number) => void;
  /** Show a process on the Processes page. */
  goto: (pid: number) => void;
}

const CRITICAL = new Set(["Hyprland", "systemd", "greetd", "dbus-broker", "pipewire"]);

const fatal = (sig: number) => ["term", "core"].includes(signalByNum(sig).action);

/** Destructive enough to confirm: more than one process dies, or something important / foreign. */
export function needsConfirm(procs: Proc[], pids: number[], sig: number, tree: boolean): boolean {
  if (!fatal(sig)) return false;
  if (pids.length > 1 || tree) return true;
  const p = procs.find((x) => x.pid === pids[0]);
  if (!p) return false;
  if (CRITICAL.has(p.name) || p.user !== ME) return true;
  return sendSignal(procs, pids, sig, { as: "root" }).results.some((r) => r.alsoExited.length > 0);
}

function useListKeys(count: number, initial: number, onPick: (i: number) => void, onClose: () => void) {
  const [i, setI] = useState(initial);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") setI((x) => Math.min(count - 1, x + 1));
    else if (e.key === "ArrowUp") setI((x) => Math.max(0, x - 1));
    else if (e.key === "Home") setI(0);
    else if (e.key === "End") setI(count - 1);
    else if (e.key === "Enter") onPick(i);
    else if (e.key === "Escape") onClose();
    else return false;
    e.preventDefault();
    e.stopPropagation();
    return true;
  };
  return [i, setI, onKeyDown] as const;
}

const who = (procs: Proc[], pids: number[]) => {
  const ps = pids.map((pid) => procs.find((p) => p.pid === pid)).filter((p): p is Proc => !!p);
  return ps.length === 1 ? `${ps[0]!.name} (${ps[0]!.pid})` : `${ps.length} processes`;
};

export function SignalDialog({ procs, pids, sig = 15, onSend, onClose }: { procs: Proc[]; pids: number[]; sig?: number; onSend: (sig: number, tree: boolean) => void; onClose: () => void }) {
  const [tree, setTree] = useState(false);
  const [typed, setTyped] = useState("");
  const pick = (n: number) => onSend(SIGNALS[n]!.num, tree);
  const [i, setI, listKeys] = useListKeys(SIGNALS.length, Math.max(0, SIGNALS.findIndex((s) => s.num === sig)), pick, onClose);
  const hasKids = pids.some((pid) => descendants(procs, pid).length > 0);
  const s = SIGNALS[i]!;
  return (
    <div
      data-component="SignalDialog"
      className={dialog}
      role="dialog"
      aria-label="Send signal"
      tabIndex={-1}
      ref={(el) => el?.focus()}
      onKeyDown={(e) => {
        if (listKeys(e)) return;
        // Type a number to jump, like htop's F9 menu.
        if (/^\d$/.test(e.key)) {
          const next = (typed + e.key).slice(-2);
          const hit = SIGNALS.findIndex((x) => String(x.num) === next) + 1 || SIGNALS.findIndex((x) => String(x.num) === e.key) + 1;
          if (hit) setI(hit - 1);
          setTyped(next);
          e.preventDefault();
        } else if (e.key === "t") {
          setTree((t) => !t);
        }
      }}
    >
      <header className={dialogHeader}>
        <Icon name="flash" size={16} />
        <b>Send signal</b>
        <span className="text-overlay1">to {who(procs, pids)}</span>
      </header>
      <ul className="m-0 list-none overflow-auto p-1" role="listbox">
        {SIGNALS.map((x, n) => (
          <li
            key={x.num}
            role="option"
            aria-selected={n === i}
            className={cx("grid h-7 cursor-pointer grid-cols-[28px_92px_auto_1fr] items-center gap-2.5 px-2.5", n === i && "bg-surface0 shadow-[inset_2px_0_0_var(--hx-mauve)]")}
            onMouseEnter={() => setI(n)}
            onClick={() => pick(n)}
          >
            <span className="text-right text-overlay1 tabular-nums">{x.num}</span>
            <b>{x.name}</b>
            {x.uncatchable && <span className={tag()}>uncatchable</span>}
            <span className="justify-self-end text-[11px] text-overlay1">{x.action === "core" ? "term + core" : x.action}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 min-h-[2.6em] border-t border-surface0 px-3.5 py-2.5 text-subtext0">{s.desc}</p>
      <footer className={dialogFooter}>
        {hasKids && (
          <label className={check}>
            <input type="checkbox" checked={tree} onChange={(e) => setTree(e.target.checked)} /> Whole process tree <Kbd>T</Kbd>
          </label>
        )}
        <span className="flex-1" />
        <span className="text-overlay1">type a number · ↑↓ · ⏎</span>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" variant={fatal(s.num) ? "danger" : "primary"} onClick={() => pick(i)}>
          Send {s.name}
        </Button>
      </footer>
    </div>
  );
}

export function ReniceDialog({ proc, as, onApply, onClose }: { proc: Proc; as: string; onApply: (nice: number) => void; onClose: () => void }) {
  const [nice, setNice] = useState(proc.nice);
  const needsRoot = as !== "root" && (nice < proc.nice || proc.user !== as);
  return (
    <form
      data-component="ReniceDialog"
      className={dialog}
      aria-label="Change priority"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(nice);
      }}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <header className={dialogHeader}>
        <Icon name="gauge" size={16} />
        <b>Change priority</b>
        <span className="text-overlay1">
          {proc.name} ({proc.pid}) · now nice {proc.nice}
        </span>
      </header>
      <div className="flex flex-col gap-2.5 p-3.5 [&_p]:m-0 [&_p]:leading-normal">
        <div className="flex items-baseline gap-2.5">
          <b className="text-[28px] text-mauve tabular-nums">{nice > 0 ? `+${nice}` : nice}</b>
          <span className="text-overlay1">{PRIORITIES.reduce((a, b) => (Math.abs(b.nice - nice) < Math.abs(a.nice - nice) ? b : a)).label}</span>
        </div>
        <input type="range" className="w-full accent-mauve" min={-20} max={19} value={nice} autoFocus onChange={(e) => setNice(Number(e.target.value))} aria-label="nice" />
        <div className="flex justify-between text-[11px] text-overlay1">
          <span>-20 · more CPU</span>
          <span>19 · less CPU</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p.nice}
              type="button"
              className={cx("unbutton flex cursor-pointer flex-col items-start border border-surface0 px-2 py-1 text-[11.5px]", p.nice === nice && "border-mauve text-mauve")}
              onClick={() => setNice(p.nice)}
            >
              {p.label}
              <small className="text-overlay1">{p.hint}</small>
            </button>
          ))}
        </div>
        <p className="text-overlay1">
          The scheduler gives lower nice values a bigger share of CPU time. Anyone can lower their own processes' priority; raising it (a lower nice value) needs root.
          {needsRoot && <b className="text-peach"> This change will ask for authentication.</b>}
        </p>
      </div>
      <footer className={dialogFooter}>
        <span className="flex-1" />
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" variant="primary" type="submit" disabled={nice === proc.nice}>
          renice {nice}
        </Button>
      </footer>
    </form>
  );
}

export function ConfirmDialog({ procs, pids, sig, tree: initialTree, onConfirm, onSkip, onClose }: { procs: Proc[]; pids: number[]; sig: number; tree: boolean; onConfirm: (tree: boolean) => void; onSkip: (skip: boolean) => void; onClose: () => void }) {
  const [tree, setTree] = useState(initialTree);
  const [skip, setSkip] = useState(false);
  const dry = sendSignal(procs, pids, sig, { as: "root", tree });
  const targets = pids.map((pid) => procs.find((p) => p.pid === pid)).filter((p): p is Proc => !!p);
  const dying = dry.results.filter((r) => r.outcome === "exited");
  const collateral = [...new Map(dry.results.flatMap((r) => r.alsoExited).map((x) => [x.pid, x])).values()];
  const total = dying.length + collateral.filter((c) => !dying.some((d) => d.pid === c.pid)).length;
  const foreign = targets.filter((p) => p.user !== ME);
  const s = signalByNum(sig);
  const hasKids = pids.some((pid) => descendants(procs, pid).length > 0);
  const verb = sig === 9 ? "Kill" : "End";
  return (
    <div data-component="ConfirmDialog" className={cx(dialog, "border-t-red")} role="alertdialog" aria-label="Confirm" tabIndex={-1} ref={(el) => el?.focus()} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <header className={dialogHeader}>
        <Icon name="alert" size={16} className="text-red" />
        <b>
          {verb} {targets.length === 1 ? targets[0]!.name : `${targets.length} processes`}?
        </b>
        <span className="text-overlay1">{s.name}</span>
      </header>
      <div className="flex flex-col gap-2.5 p-3.5 [&_p]:m-0 [&_p]:leading-normal">
        <ul className="m-0 flex list-none flex-col gap-[3px] p-0">
          {targets.slice(0, 6).map((p) => (
            <li key={p.pid}>
              <b>{p.name}</b> <span className="text-overlay1">PID {p.pid} · {p.user}</span>
            </li>
          ))}
          {targets.length > 6 && <li className="text-overlay1">+ {targets.length - 6} more</li>}
        </ul>
        {collateral.length > 0 && (
          <p>
            <b>{collateral.length}</b> other process{collateral.length > 1 ? "es" : ""} will exit with {targets.length > 1 ? "them" : "it"} ({[...new Set(collateral.map((c) => c.name))].slice(0, 5).join(", ")}…): helpers and terminal jobs don't outlive their parent.
          </p>
        )}
        {dry.results.some((r) => r.outcome === "handled") && <p className="text-overlay1">Some targets handle {s.name} themselves and may keep running: {dry.results.filter((r) => r.outcome === "handled").map((r) => r.name).join(", ")}.</p>}
        {targets.some((p) => p.name === "Hyprland") && <p className="text-peach">This ends your Hyprland session: every window closes and you're back at the greeter.</p>}
        {targets.some((p) => CRITICAL.has(p.name) && p.name !== "Hyprland") && <p className="text-peach">This is a core system / session process; things will break until it restarts.</p>}
        {foreign.length > 0 && <p className="text-overlay1">Owned by {[...new Set(foreign.map((p) => p.user))].join(", ")}: you'll be asked to authenticate.</p>}
        <p className="text-overlay1">Unsaved work in {total > 1 ? `these ${total} processes` : "this process"} will be lost.</p>
      </div>
      <footer className={dialogFooter}>
        {hasKids && (
          <label className={check}>
            <input type="checkbox" checked={tree} onChange={(e) => setTree(e.target.checked)} /> Whole process tree
          </label>
        )}
        <label className={check}>
          <input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} /> Don't ask again
        </label>
        <span className="flex-1" />
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => {
            onSkip(skip);
            onConfirm(tree);
          }}
        >
          {verb} {total > 1 ? `${total} processes` : "process"}
        </Button>
      </footer>
    </div>
  );
}
