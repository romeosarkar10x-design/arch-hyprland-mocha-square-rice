import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "../foundations/icon";
import { Kbd } from "../foundations/kbd";
import type { IconName } from "../icons";
import { accentVar, cx, type Accent } from "../lib";

export interface PowerAction {
  id: string;
  label: string;
  icon: IconName;
  accent?: Accent;
  /** Single-key shortcut while the menu has focus. */
  key: string;
  /** Destructive: must be held for `holdMs`. */
  confirm?: boolean;
}

export const defaultPowerActions: PowerAction[] = [
  { id: "lock", label: "Lock", icon: "lock", accent: "lavender", key: "L" },
  { id: "logout", label: "Log out", icon: "logout", accent: "mauve", key: "E" },
  { id: "suspend", label: "Suspend", icon: "suspend", accent: "sky", key: "S" },
  { id: "reboot", label: "Reboot", icon: "reboot", accent: "peach", key: "R", confirm: true },
  { id: "shutdown", label: "Shut down", icon: "power", accent: "red", key: "P", confirm: true },
];

export interface PowerMenuProps {
  actions?: PowerAction[];
  /** How long a destructive action must be held. */
  holdMs?: number;
  onAction?: (id: string) => void;
  /** Uptime / user line under the grid. */
  footer?: ReactNode;
  className?: string;
}

/** Session menu: lock, log out, suspend fire on click/key; reboot and shut down must be held until the tile fills. */
export function PowerMenu({ actions = defaultPowerActions, holdMs = 900, onAction, footer, className }: PowerMenuProps) {
  const [hold, setHold] = useState<{ id: string; t0: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [fired, setFired] = useState<string | null>(null);
  useEffect(() => {
    if (!hold || typeof requestAnimationFrame === "undefined") return;
    let id = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - hold.t0) / holdMs);
      setProgress(p);
      if (p >= 1) {
        fire(hold.id);
        setHold(null);
        return;
      }
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [hold, holdMs]);
  const fire = (id: string) => {
    setFired(id);
    onAction?.(id);
    setTimeout(() => setFired(null), 900);
  };
  const start = (a: PowerAction) => (a.confirm ? setHold({ id: a.id, t0: performance.now() }) : fire(a.id));
  const cancel = () => {
    setHold(null);
    setProgress(0);
  };
  return (
    <div
      className={cx("hx-power", className)}
      tabIndex={-1}
      onKeyDown={(e) => {
        const a = actions.find((x) => x.key.toLowerCase() === e.key.toLowerCase());
        if (a && !e.repeat) start(a);
      }}
      onKeyUp={cancel}
    >
      <div className="hx-power-grid" style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(112px, 1fr))` }}>
        {actions.map((a) => {
          const p = hold?.id === a.id ? progress : fired === a.id ? 1 : 0;
          return (
            <button
              key={a.id}
              type="button"
              className={cx("hx-pw", p > 0 && "is-filling", fired === a.id && "is-fired")}
              style={{ ["--hx-acc" as string]: accentVar(a.accent), ["--hx-hold" as string]: p }}
              onPointerDown={() => start(a)}
              onPointerUp={cancel}
              onPointerLeave={cancel}
            >
              <Kbd>{a.key}</Kbd>
              <Icon name={a.icon} className="hx-pw-icon" />
              <span className="hx-pw-label">{a.label}</span>
              {a.confirm && <span className="hx-pw-hint">hold</span>}
            </button>
          );
        })}
      </div>
      <div className="hx-power-foot">
        {footer ?? (
          <>
            <span>romeo@archlinux</span>
            <span>up 3h 12m · linux 7.2.2-arch1-1</span>
          </>
        )}
      </div>
    </div>
  );
}
