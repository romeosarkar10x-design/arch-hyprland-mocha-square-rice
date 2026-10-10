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
  className?: string;
}

/** Hyprland workspace strip with app icons. Focused = surface1 block + mauve top strip; urgent blinks red. Wheel cycles. */
export function Workspaces({ workspaces, active, onSelect, showApps = true, className }: WorkspacesProps) {
  return (
    <nav
      className={cx("hx-ws", className)}
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
        return (
          <button
            key={w.id}
            type="button"
            aria-current={w.id === active ? "true" : undefined}
            className={cx("hx-ws-btn", has && "has-apps", w.id === active && "is-active", w.urgent && "is-urgent")}
            onClick={() => onSelect?.(w.id)}
          >
            <span className="hx-ws-num">{w.id % 10}</span>
            {showApps && has && (
              <span className="hx-ws-apps">
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
