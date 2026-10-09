import { useState, type KeyboardEvent } from "react";
import { Button, Icon } from "../ui";
import { ME } from "./demo";
import { PRIORITIES, SIGNALS, descendants, sendSignal, signalByNum, type Proc } from "./procs";

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
      className="rx-tm-dialog"
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
      <header>
        <Icon name="flash" size={16} />
        <b>Send signal</b>
        <span className="hx-faint">to {who(procs, pids)}</span>
      </header>
      <ul className="rx-tm-siglist" role="listbox">
        {SIGNALS.map((x, n) => (
          <li key={x.num} role="option" aria-selected={n === i} className={n === i ? "is-active" : undefined} onMouseEnter={() => setI(n)} onClick={() => pick(n)}>
            <span className="rx-tm-signum">{x.num}</span>
            <b>{x.name}</b>
            {x.uncatchable && <span className="rx-tm-tag">uncatchable</span>}
            <span className="rx-tm-sigact">{x.action === "core" ? "term + core" : x.action}</span>
          </li>
        ))}
      </ul>
      <p className="rx-tm-sigdesc">{s.desc}</p>
      <footer>
        {hasKids && (
          <label className="rx-tm-check">
            <input type="checkbox" checked={tree} onChange={(e) => setTree(e.target.checked)} /> Whole process tree <kbd className="hx-kbd">T</kbd>
          </label>
        )}
        <span className="hx-spacer" />
        <span className="hx-faint">type a number · ↑↓ · ⏎</span>
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
      className="rx-tm-dialog rx-tm-renice"
      aria-label="Change priority"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(nice);
      }}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <header>
        <Icon name="gauge" size={16} />
        <b>Change priority</b>
        <span className="hx-faint">
          {proc.name} ({proc.pid}) · now nice {proc.nice}
        </span>
      </header>
      <div className="rx-tm-renice-body">
        <div className="rx-tm-renice-val">
          <b>{nice > 0 ? `+${nice}` : nice}</b>
          <span className="hx-faint">{PRIORITIES.reduce((a, b) => (Math.abs(b.nice - nice) < Math.abs(a.nice - nice) ? b : a)).label}</span>
        </div>
        <input type="range" min={-20} max={19} value={nice} autoFocus onChange={(e) => setNice(Number(e.target.value))} aria-label="nice" />
        <div className="rx-tm-renice-scale hx-faint">
          <span>-20 · more CPU</span>
          <span>19 · less CPU</span>
        </div>
        <div className="rx-tm-presets">
          {PRIORITIES.map((p) => (
            <button key={p.nice} type="button" className={p.nice === nice ? "is-active" : undefined} onClick={() => setNice(p.nice)}>
              {p.label}
              <small>{p.hint}</small>
            </button>
          ))}
        </div>
        <p className="hx-faint">
          The scheduler gives lower nice values a bigger share of CPU time. Anyone can lower their own processes' priority; raising it (a lower nice value) needs root.
          {needsRoot && <b className="rx-tm-warn"> This change will ask for authentication.</b>}
        </p>
      </div>
      <footer>
        <span className="hx-spacer" />
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
    <div className="rx-tm-dialog rx-tm-confirm" role="alertdialog" aria-label="Confirm" tabIndex={-1} ref={(el) => el?.focus()} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <header>
        <Icon name="alert" size={16} className="hx-red" />
        <b>
          {verb} {targets.length === 1 ? targets[0]!.name : `${targets.length} processes`}?
        </b>
        <span className="hx-faint">{s.name}</span>
      </header>
      <div className="rx-tm-confirm-body">
        <ul>
          {targets.slice(0, 6).map((p) => (
            <li key={p.pid}>
              <b>{p.name}</b> <span className="hx-faint">PID {p.pid} · {p.user}</span>
            </li>
          ))}
          {targets.length > 6 && <li className="hx-faint">+ {targets.length - 6} more</li>}
        </ul>
        {collateral.length > 0 && (
          <p>
            <b>{collateral.length}</b> other process{collateral.length > 1 ? "es" : ""} will exit with {targets.length > 1 ? "them" : "it"} ({[...new Set(collateral.map((c) => c.name))].slice(0, 5).join(", ")}…): helpers and terminal jobs don't outlive their parent.
          </p>
        )}
        {dry.results.some((r) => r.outcome === "handled") && <p className="hx-faint">Some targets handle {s.name} themselves and may keep running: {dry.results.filter((r) => r.outcome === "handled").map((r) => r.name).join(", ")}.</p>}
        {targets.some((p) => p.name === "Hyprland") && <p className="rx-tm-warn">This ends your Hyprland session: every window closes and you're back at the greeter.</p>}
        {targets.some((p) => CRITICAL.has(p.name) && p.name !== "Hyprland") && <p className="rx-tm-warn">This is a core system / session process; things will break until it restarts.</p>}
        {foreign.length > 0 && <p className="hx-faint">Owned by {[...new Set(foreign.map((p) => p.user))].join(", ")}: you'll be asked to authenticate.</p>}
        <p className="hx-faint">Unsaved work in {total > 1 ? `these ${total} processes` : "this process"} will be lost.</p>
      </div>
      <footer>
        {hasKids && (
          <label className="rx-tm-check">
            <input type="checkbox" checked={tree} onChange={(e) => setTree(e.target.checked)} /> Whole process tree
          </label>
        )}
        <label className="rx-tm-check">
          <input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} /> Don't ask again
        </label>
        <span className="hx-spacer" />
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
