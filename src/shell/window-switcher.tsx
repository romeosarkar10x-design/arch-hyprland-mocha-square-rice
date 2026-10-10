import { IconTile, Kbd, cx } from "../ui";
import { usePropState } from "../use-prop-state";
import { demoWorkspaces, type DemoWindow } from "./windows";

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
      data-component="WindowSwitcher"
      className={cx("kit-type inline-flex max-w-full flex-col bg-mantle text-text shadow-popup ring ring-surface0 outline-none", className)}
      onKeyDown={(e) => {
        const n = windows.length;
        if (e.key === "Tab" || e.key === "ArrowRight") setSel((s) => (s + (e.shiftKey ? n - 1 : 1)) % n);
        else if (e.key === "ArrowLeft") setSel((s) => (s + n - 1) % n);
        else if (e.key === "Enter") pick(sel);
        else return;
        e.preventDefault();
      }}
    >
      <div className="flex gap-1 overflow-x-auto p-3.5">
        {windows.map((w, i) => (
          <button
            key={w.id}
            type="button"
            className={cx(
              "unbutton flex w-28 cursor-pointer flex-col items-center gap-2 bg-transparent px-1.5 pt-3.5 pb-2.5 font-hx text-[11px] text-subtext0",
              "inset-ring inset-ring-transparent transition-[background-color] hover:bg-surface0",
              i === sel && "bg-mauve/12 text-text inset-ring-2 inset-ring-mauve hover:bg-mauve/12",
            )}
            onClick={() => (setSel(i), pick(i))}
            onMouseEnter={() => setSel(i)}
          >
            <IconTile icon={w.icon} accent={w.accent} size={56} />
            <span className="max-w-full truncate">{w.cls}</span>
            <span className="text-[10px] text-overlay1">ws {w.workspace}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 border-t border-surface0 bg-crust px-3.5 py-2.5 text-[12px]">
        <span className="truncate text-lavender italic">{windows[sel]?.title}</span>
        <span className="flex-1" />
        <Kbd>ALT</Kbd>
        <Kbd>TAB</Kbd>
        <span className="text-overlay1">cycle</span>
      </div>
    </div>
  );
}
