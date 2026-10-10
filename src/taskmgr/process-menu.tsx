import type { ReactNode } from "react";
import { Icon, Kbd, cx, type IconName } from "../ui";
import type { Ask } from "./dialogs";
import type { Row } from "./procs";
import { menu as menuCls } from "./styles";

const hr = "my-1 h-px w-full border-0 bg-surface0";

export function ContextMenu({
  x,
  y,
  row,
  targets,
  tagged,
  ask,
  onClose,
  onToggle,
  onTag,
  onParent,
  onDetails,
}: {
  x: number;
  y: number;
  row: Row;
  targets: number[];
  tagged: boolean;
  ask: Ask;
  onClose: () => void;
  onToggle?: () => void;
  onTag: () => void;
  onParent?: () => void;
  onDetails: () => void;
}) {
  const p = row.proc;
  const n = targets.length;
  const what = tagged ? `${n} tagged` : n > 1 ? `${n} processes` : "";
  const item = (label: ReactNode, run: () => void, o: { kbd?: string; icon?: IconName; danger?: boolean; disabled?: boolean } = {}) => (
    <button
      type="button"
      role="menuitem"
      className={cx(
        "unbutton flex h-7 cursor-pointer items-center gap-2.5 px-2.5 text-left whitespace-nowrap enabled:hover:bg-surface0 disabled:cursor-default disabled:opacity-40",
        o.danger && "enabled:hover:bg-red/22 enabled:hover:text-red",
      )}
      disabled={o.disabled}
      onClick={() => (onClose(), run())}
    >
      <Icon name={o.icon ?? "minus"} size={13} className="text-overlay1" />
      <span className="flex-1">{label}</span>
      {o.kbd && <Kbd className="text-[10px]">{o.kbd}</Kbd>}
    </button>
  );
  const stopped = p?.state === "T";
  const copy = (text: string) => void navigator.clipboard?.writeText(text);
  return (
    <div
      data-component="ContextMenu"
      className={menuCls}
      role="menu"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="mb-1 border-b border-surface0 px-2.5 pt-[5px] pb-1.5 font-bold whitespace-nowrap">
        {row.label}
        {p && <span className="text-overlay1"> · PID {p.pid}</span>}
        {what && <span className="text-overlay1"> · {what}</span>}
      </header>
      {item("End task", () => ask.send(targets, 15), { kbd: "DEL", icon: "close", danger: true })}
      {item("Kill", () => ask.send(targets, 9), { kbd: "⇧DEL", icon: "flash", danger: true })}
      {item("Kill process tree", () => ask.send(targets, 9, true), {
        icon: "branch",
        danger: true,
        disabled: !row.hasChildren && !(p && row.count > 1) && row.kind !== "group",
      })}
      <hr className={hr} />
      {stopped
        ? item("Resume (SIGCONT)", () => ask.send(targets, 18), { icon: "play" })
        : item("Suspend (SIGSTOP)", () => ask.send(targets, 19), { icon: "pause" })}
      {item("Send signal…", () => ask.signal(targets), { kbd: "K", icon: "flash" })}
      {item("Change priority…", () => p && ask.renice(p.pid), { kbd: "N", icon: "gauge", disabled: !p })}
      <hr className={hr} />
      {onToggle && item(row.expanded ? "Collapse" : "Expand", onToggle, { kbd: row.expanded ? "←" : "→", icon: row.expanded ? "up" : "down" })}
      {item(tagged && row.pids.every((pid) => targets.includes(pid)) ? "Untag" : "Tag", onTag, { kbd: "SPACE", icon: "check" })}
      {onParent && item("Go to parent", onParent, { kbd: "P", icon: "up" })}
      {p && item("Copy PID", () => copy(String(p.pid)), { icon: "note" })}
      {p && item("Copy command line", () => copy(p.cmd), { icon: "code" })}
      {item("Properties", onDetails, { kbd: "⏎", icon: "info" })}
    </div>
  );
}
