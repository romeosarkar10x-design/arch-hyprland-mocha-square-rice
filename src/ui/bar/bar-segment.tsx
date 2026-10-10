import type { MouseEventHandler, PointerEventHandler, ReactNode, Ref, WheelEventHandler } from "react";
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
  /** Solid block variants for the launcher (mauve) and power (red) ends; `tray` spaces out a row of status icons. */
  variant?: "clock" | "power" | "plain" | "launcher" | "title" | "media" | "tray";
  /** Visually dim (e.g. muted audio, paused media). */
  dim?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Hover in / out, e.g. to show a Tooltip. */
  onPointerEnter?: PointerEventHandler<HTMLButtonElement>;
  onPointerLeave?: PointerEventHandler<HTMLButtonElement>;
  /** Scroll over the segment, e.g. volume ±2%. */
  onWheel?: WheelEventHandler<HTMLButtonElement>;
  label?: string;
  className?: string;
  /** The Desktop anchors popups to their segment through this. */
  ref?: Ref<HTMLButtonElement>;
}

const variants = {
  plain: "",
  clock: "px-[18px] font-bold",
  launcher: "bg-mauve px-[15px] text-crust hover:bg-pink",
  power: "bg-surface0 px-[15px] text-red hover:bg-red hover:text-crust",
  title: "max-w-[520px] min-w-0 flex-[0_1_auto] cursor-default overflow-hidden text-lavender italic hover:bg-transparent",
  media: "max-w-[320px]",
  tray: "gap-2.5 text-subtext0",
};

// Solid ends keep their own fill while open instead of the surface0 + top strip.
const openFill = {
  launcher: "bg-pink",
  power: "bg-red text-crust",
};

const levels = {
  ok: "",
  warn: "text-yellow",
  crit: "bg-red text-crust hover:bg-red [&_[data-component=Unit]]:text-inherit [&_[data-component=Unit]]:opacity-70",
};

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
  onPointerEnter,
  onPointerLeave,
  onWheel,
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
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onWheel={onWheel}
      data-component="BarSegment"
      data-variant={variant}
      className={cx(
        "unbutton kit-type relative flex flex-none cursor-pointer items-center gap-[7px] bg-transparent px-3 whitespace-nowrap text-(--hx-seg)",
        "transition-[background-color,color] duration-200 hover:bg-surface0",
        variants[variant],
        divider && "shadow-[inset_1px_0_0_var(--hx-surface1)]",
        open &&
          (variant === "launcher" || variant === "power"
            ? openFill[variant]
            : "bg-surface0 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-current"),
        dim && "text-overlay1",
        levels[level],
        className,
      )}
      style={{ ["--hx-seg" as string]: accentVar(accent, "text") }}
    >
      {icon && <Icon name={icon} className={variant === "launcher" ? "text-[20px]" : "text-[18px]"} />}
      {children != null && (
        <span
          className={cx(
            "inline-flex items-center gap-[5px]",
            variant === "tray" ? "[&_svg]:text-[16px]" : "[&_svg]:text-[14px] [&_svg]:opacity-80",
            (variant === "title" || variant === "media") && "block min-w-0 overflow-hidden text-ellipsis",
          )}
        >
          {children}
        </span>
      )}
      {spark && <Sparkline data={spark} />}
    </button>
  );
}
