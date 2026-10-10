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

/** Square button. Icon carries the accent at rest; hover floods the whole button with it. */
export function Button({ variant = "secondary", size = "md", accent, icon, kbd, block, className, style, children, ...rest }: ButtonProps) {
  const acc = accentVar(variant === "danger" ? (accent ?? "red") : accent);
  return (
    <button
      type="button"
      className={cx("hx-btn", `hx-btn--${variant}`, `hx-btn--${size}`, block && "hx-btn--block", className)}
      style={{ ["--hx-acc" as string]: acc, ...style }}
      {...rest}
    >
      {icon && <Icon name={icon} className="hx-btn-icon" />}
      {children != null && <span className="hx-btn-label">{children}</span>}
      {kbd && <Kbd>{kbd}</Kbd>}
    </button>
  );
}
