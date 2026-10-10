import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Icon } from "../foundations/icon";
import { Kbd } from "../foundations/kbd";
import { type IconName } from "../icons";
import { accentVar, cx, type Accent } from "../lib";

/** Extra props (onClick, disabled, title...) go to the <button>. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Filled (primary), plain surface (secondary), outline only (ghost) or red (danger). */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** sm = 26px, md = 32px, lg = 40px. */
  size?: "sm" | "md" | "lg";
  /** Accent colour token for the icon and hover fill. */
  accent?: Accent;
  /** Leading icon. */
  icon?: IconName;
  /** Shortcut hint drawn as a keycap at the end. */
  kbd?: string;
  /** Stretch to the container width. */
  block?: boolean;
  children?: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

const base =
  "unbutton kit-type group/btn inline-flex cursor-pointer items-center justify-center gap-2 bg-surface0 font-hx leading-none font-medium text-text " +
  "transition-[background-color,color,box-shadow] hover:bg-acc hover:text-crust active:translate-y-px disabled:pointer-events-none disabled:opacity-40";

const sizes = {
  sm: "h-[26px] gap-1.5 px-[9px] text-[11px]",
  md: "h-8 px-3 text-[12px]",
  lg: "h-10 px-4 text-[13px]",
};

const variants = {
  primary: "bg-acc text-crust hover:bg-[color-mix(in_srgb,var(--hx-acc)_82%,white)]",
  secondary: "",
  ghost: "bg-transparent inset-ring inset-ring-surface1 hover:bg-acc/14 hover:text-text hover:inset-ring-acc",
  danger: "bg-[color-mix(in_srgb,var(--hx-red)_12%,var(--hx-surface0))] text-red",
};

const iconTone = {
  primary: "text-crust",
  secondary: "group-hover/btn:text-crust",
  ghost: "group-hover/btn:text-acc",
  danger: "group-hover/btn:text-crust",
};

// On a filled button the keycap goes outline-only in the button's text colour.
const filledKbd = "border-current bg-transparent text-inherit opacity-55";

/** Square button. Icon carries the accent at rest; hover floods the whole button with it. */
export function Button({ variant = "secondary", size = "md", accent, icon, kbd, block, className, style, children, ...rest }: ButtonProps) {
  const acc = accentVar(variant === "danger" ? (accent ?? "red") : accent);
  return (
    <button
      type="button"
      data-component="Button"
      className={cx(base, sizes[size], variants[variant], block && "flex w-full", className)}
      style={{ ["--hx-acc" as string]: acc, ...style }}
      {...rest}
    >
      {icon && <Icon name={icon} className={cx("text-[1.25em] text-acc transition-colors", iconTone[variant])} />}
      {children != null && <span>{children}</span>}
      {kbd && (
        <Kbd
          className={cx(
            "ml-[2px]",
            variant === "primary"
              ? filledKbd
              : "group-hover/btn:border-current group-hover/btn:bg-transparent group-hover/btn:text-inherit group-hover/btn:opacity-55",
          )}
        >
          {kbd}
        </Kbd>
      )}
    </button>
  );
}
