import type { MouseEventHandler, ReactNode, Ref } from "react";
import { Sparkline } from "../data/sparkline";
import { Icon } from "../foundations/icon";
import { type IconName } from "../icons";
import { accentVar, cx, type Accent, type Level } from "../lib";

export interface BarSegmentProps {
  icon?: IconName;
  /** Main readout, e.g. "12%". */
  children?: ReactNode;
  /** Text colour of the whole segment. */
  accent?: Accent;
  /** warn turns the text yellow; crit floods the segment red. */
  level?: Level;
  /** Recent samples, drawn as a tiny bar sparkline after the readout. */
  spark?: number[];
  /** Draw the 1px divider on the left (right-hand modules use this). */
  divider?: boolean;
  /** Popup for this segment is open: surface fill and a 2px accent strip on top. */
  open?: boolean;
  /** Solid block variants for the launcher (mauve) and power (red) ends. */
  variant?: "clock" | "power" | "plain" | "launcher" | "title" | "media";
  /** Visually dim (e.g. muted audio, paused media). */
  dim?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  label?: string;
  className?: string;
  /** The Desktop anchors popups to their segment through this. */
  ref?: Ref<HTMLButtonElement>;
}

/** One bar module. Colour lives in the text; hover lifts to surface0; `open` adds a 2px top strip in the text colour. */
export function BarSegment({
  icon,
  children,
  accent = "text",
  level = "ok",
  spark,
  divider,
  open,
  variant = "plain",
  dim,
  onClick,
  label,
  className,
  ref,
}: BarSegmentProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={onClick}
      className={cx(
        "hx-seg",
        `hx-seg--${variant}`,
        divider && "has-divider",
        open && "is-open",
        dim && "is-dim",
        level !== "ok" && `is-${level}`,
        className,
      )}
      style={{ ["--hx-seg" as string]: accentVar(accent, "text") }}
    >
      {icon && <Icon name={icon} className="hx-seg-icon" />}
      {children != null && <span className="hx-seg-text">{children}</span>}
      {spark && <Sparkline data={spark} />}
    </button>
  );
}
