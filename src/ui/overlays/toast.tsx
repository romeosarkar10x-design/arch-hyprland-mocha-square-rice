import { type ReactNode } from "react";
import { Icon } from "../foundations/icon";
import { IconTile } from "../foundations/icon-tile";
import { type IconName } from "../icons";
import { accentVar, cx, type Accent } from "../lib";

export interface ToastAction {
  label: string;
  onClick?: () => void;
}

export interface ToastProps {
  /** App name in the meta line. */
  app: string;
  appIcon?: IconName;
  title: string;
  body?: ReactNode;
  /** Strip, tile and countdown colour. Critical notifications use red. */
  accent?: Accent;
  urgency?: "low" | "normal" | "critical";
  /** e.g. "now", "2m". */
  time?: string;
  actions?: ToastAction[];
  /** Auto-dismiss after this many ms (countdown line pauses on hover). 0 = sticky. */
  timeout?: number;
  onClose?: () => void;
  className?: string;
}

/** Notification card: accent top strip, app tile, actions row, countdown line that pauses on hover. */
export function Toast({
  app,
  appIcon = "bell",
  title,
  body,
  accent,
  urgency = "normal",
  time = "now",
  actions,
  timeout = 0,
  onClose,
  className,
}: ToastProps) {
  const acc = accent ?? (urgency === "critical" ? "red" : urgency === "low" ? "lavender" : "mauve");
  return (
    <div
      data-component="Toast"
      data-urgency={urgency}
      className={cx(
        "kit-type group/toast relative w-[360px] animate-slide overflow-hidden border-t-2 border-acc bg-mantle text-text shadow-popup ring ring-surface0",
        urgency === "critical" && "bg-[color-mix(in_srgb,var(--hx-red)_8%,var(--hx-mantle))]",
        className,
      )}
      role="status"
      style={{ ["--hx-acc" as string]: accentVar(acc), ["--hx-life" as string]: `${timeout}ms` }}
      onAnimationEnd={(e) => {
        if (e.animationName === "hx-timer") onClose?.();
      }}
    >
      <div className="grid grid-cols-[36px_1fr_24px] gap-3 py-3 pr-2.5 pl-3.5">
        <IconTile icon={appIcon} accent={acc} size={36} />
        <div className="min-w-0">
          <div className="flex gap-1.5 text-[10.5px] text-subtext0">
            <span>{app}</span>
            <span className="text-overlay1">
              {"· "}
              {time}
            </span>
          </div>
          <div className="mt-0.5 text-[13px] font-bold">{title}</div>
          {body && <div className="mt-0.5 text-[12px] text-subtext0">{body}</div>}
        </div>
        <button
          type="button"
          className={cx(
            "unbutton grid size-6 cursor-pointer place-items-center bg-transparent text-[14px] text-overlay1 opacity-0",
            "transition-[opacity,background-color] group-hover/toast:opacity-100 hover:bg-surface0 hover:text-text focus-visible:opacity-100",
          )}
          aria-label="Dismiss"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      {actions && actions.length > 0 && <ToastActions actions={actions} />}
      {timeout > 0 && (
        <i className="absolute bottom-0 left-0 h-0.5 w-full origin-left animate-timer bg-acc group-hover/toast:[animation-play-state:paused]" />
      )}
    </div>
  );
}

/** Row of action buttons under a toast; the first carries the accent. */
function ToastActions({ actions }: { actions: ToastAction[] }) {
  return (
    <div data-component="ToastActions" className="flex gap-px border-t border-surface0 bg-surface0">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          className="unbutton flex-1 cursor-pointer bg-mantle p-[9px] font-hx text-[12px] text-text transition-[background-color,color] first:text-acc hover:bg-surface0"
          onClick={a.onClick}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
