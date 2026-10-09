import { IconTile, Kbd } from "../ui";
import { usePropState } from "../usePropState";
import { demoWorkspaces, type DemoWindow } from "./windows";
import "./shell.css";

export interface WindowSwitcherProps {
  windows?: (DemoWindow & { workspace: number })[];
  /** Index of the highlighted window. */
  selected?: number;
  onSelect?: (id: string) => void;
  className?: string;
}

const allWindows = demoWorkspaces.flatMap((ws) => ws.windows.map((w) => ({ ...w, workspace: ws.id })));

/** Alt-Tab switcher across all workspaces. Tab / arrows cycle, Enter picks. */
export function WindowSwitcher({ windows = allWindows, selected: initial = 1, onSelect, className }: WindowSwitcherProps) {
  const [sel, setSel] = usePropState(initial);
  const pick = (i: number) => onSelect?.(windows[i]!.id);
  return (
    <div
      tabIndex={0}
      className={["rx-alt", className].filter(Boolean).join(" ")}
      onKeyDown={(e) => {
        const n = windows.length;
        if (e.key === "Tab" || e.key === "ArrowRight") setSel((s) => (s + (e.shiftKey ? n - 1 : 1)) % n);
        else if (e.key === "ArrowLeft") setSel((s) => (s + n - 1) % n);
        else if (e.key === "Enter") pick(sel);
        else return;
        e.preventDefault();
      }}
    >
      <div className="rx-alt-row">
        {windows.map((w, i) => (
          <button key={w.id} type="button" className={i === sel ? "is-active" : undefined} onClick={() => (setSel(i), pick(i))} onMouseEnter={() => setSel(i)}>
            <IconTile icon={w.icon} accent={w.accent} size={56} />
            <span className="rx-alt-cls">{w.cls}</span>
            <span className="rx-alt-ws">ws {w.workspace}</span>
          </button>
        ))}
      </div>
      <div className="rx-alt-title">
        <span>{windows[sel]?.title}</span>
        <span className="hx-spacer" />
        <Kbd>ALT</Kbd>
        <Kbd>TAB</Kbd>
        <span className="hx-faint">cycle</span>
      </div>
    </div>
  );
}
