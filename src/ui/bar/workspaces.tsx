import { Icon } from "../foundations/icon";
import type { IconName } from "../icons";
import { cx } from "../lib";

export interface Workspace {
  id: number;
  /** Icons of the clients on it. */
  apps?: IconName[];
  urgent?: boolean;
}

export interface WorkspacesProps {
  workspaces: Workspace[];
  /** Focused workspace id. */
  active: number;
  onSelect?: (id: number) => void;
  /** Show app icons after the number. */
  showApps?: boolean;
  /** Hide empty workspaces unless focused (waybar's hyprland/workspaces default). */
  hideEmpty?: boolean;
  className?: string;
}

/** Hyprland workspace strip with app icons. Focused = surface1 block + mauve top strip; urgent blinks red. Wheel cycles. */
export function Workspaces({ workspaces, active, onSelect, showApps = true, hideEmpty = true, className }: WorkspacesProps) {
  return (
    <nav
      data-component="Workspaces"
      className={cx("kit-type mr-1 flex flex-none items-stretch text-text", className)}
      aria-label="Workspaces"
      onWheel={(e) => {
        if (!onSelect) return;
        const ids = workspaces.map((w) => w.id);
        const i = ids.indexOf(active);
        const next = ids[(i + (e.deltaY > 0 ? 1 : -1) + ids.length) % ids.length];
        if (next !== undefined) onSelect(next);
      }}
    >
      {workspaces.map((w) => {
        const has = (w.apps?.length ?? 0) > 0;
        const focused = w.id === active;
        return (
          <button
            key={w.id}
            type="button"
            aria-current={focused ? "true" : undefined}
            className={cx(
              "unbutton relative flex cursor-pointer items-center gap-[7px] bg-transparent px-2.5 text-overlay0",
              "transition-[color,background-color] hover:bg-surface0 hover:text-text",
              has && "text-subtext0",
              focused &&
                "bg-surface1 font-bold text-mauve hover:bg-surface1 hover:text-mauve before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:animate-grow before:bg-mauve",
              w.urgent && "animate-blink bg-red text-crust hover:bg-red hover:text-crust",
              hideEmpty && !has && !focused && "hidden",
            )}
            onClick={() => onSelect?.(w.id)}
          >
            <span>{w.id % 10}</span>
            {showApps && has && (
              <span className="flex gap-[5px] text-[15px]">
                {w.apps?.map((a, i) => (
                  <Icon key={i} name={a} />
                ))}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
