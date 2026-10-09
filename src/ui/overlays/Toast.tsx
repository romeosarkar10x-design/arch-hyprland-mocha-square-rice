import { type ReactNode } from "react";
import { Icon } from "../foundations/Icon";
import { IconTile } from "../foundations/IconTile";
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
      className={cx("hx-toast", `is-${urgency}`, className)}
      role="status"
      style={{ ["--hx-acc" as string]: accentVar(acc), ["--hx-life" as string]: `${timeout}ms` }}
      onAnimationEnd={(e) => {
        if (e.animationName === "hx-timer") onClose?.();
      }}
    >
      <div className="hx-toast-body">
        <IconTile icon={appIcon} accent={acc} size={36} />
        <div className="hx-toast-main">
          <div className="hx-toast-meta">
            <span>{app}</span>
            <span className="hx-faint">
              {"· "}
              {time}
            </span>
          </div>
          <div className="hx-toast-title">{title}</div>
          {body && <div className="hx-toast-text">{body}</div>}
        </div>
        <button type="button" className="hx-toast-close" aria-label="Dismiss" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      {actions && actions.length > 0 && (
        <div className="hx-toast-actions">
          {actions.map((a) => (
            <button key={a.label} type="button" onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </div>
      )}
      {timeout > 0 && <i className="hx-toast-timer" />}
    </div>
  );
}
