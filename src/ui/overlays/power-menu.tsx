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
      data-component="PowerMenu"
      className={cx("kit-type focus-ring w-fit text-text outline-none", className)}
      tabIndex={-1}
      onKeyDown={(e) => {
        const a = actions.find((x) => x.key.toLowerCase() === e.key.toLowerCase());
        if (a && !e.repeat) start(a);
      }}
      onKeyUp={cancel}
    >
      <div className="grid gap-px bg-surface0 shadow-popup ring ring-surface0" style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(112px, 1fr))` }}>
        {actions.map((a) => (
          <PowerTile
            key={a.id}
            action={a}
            fill={hold?.id === a.id ? progress : fired === a.id ? 1 : 0}
            fired={fired === a.id}
            onPress={() => start(a)}
            onRelease={cancel}
          />
        ))}
      </div>
      <div className="flex justify-between gap-[18px] px-0.5 pt-2.5 text-[11px] text-overlay1">
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

interface PowerTileProps {
  action: PowerAction;
  /** Hold progress 0–1; the accent fills the tile from the bottom. */
  fill: number;
  fired: boolean;
  onPress: () => void;
  onRelease: () => void;
}

function PowerTile({ action: a, fill, fired, onPress, onRelease }: PowerTileProps) {
  const lit = fill > 0 || fired;
  return (
    <button
      type="button"
      data-component="PowerTile"
      className={cx(
        "unbutton group/pw relative flex h-[120px] w-full min-w-[112px] cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden bg-mantle text-text",
        "transition-[background-color] hover:bg-base",
        "before:absolute before:inset-0 before:origin-bottom before:scale-y-(--hx-hold) before:bg-acc",
        "after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:scale-x-0 after:bg-acc after:transition-[scale] after:duration-(--hx-med) after:ease-hx hover:after:scale-x-100",
        fired && "animate-flash",
      )}
      style={{ ["--hx-acc" as string]: accentVar(a.accent), ["--hx-hold" as string]: fill }}
      onPointerDown={onPress}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
    >
      <Kbd className="absolute top-[7px] right-[7px]">{a.key}</Kbd>
      <Icon
        name={a.icon}
        className={cx(
          "relative text-[30px] transition-[color,translate] duration-(--hx-med) ease-overshot group-hover/pw:-translate-y-0.5",
          lit ? "text-crust" : "text-acc",
        )}
      />
      <span className={cx("relative text-[12px]", lit && "text-crust")}>{a.label}</span>
      {a.confirm && <span className="absolute bottom-[7px] text-[9px] tracking-[.16em] text-overlay0 uppercase">hold</span>}
    </button>
  );
}
