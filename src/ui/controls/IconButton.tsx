import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { Icon } from "../foundations/Icon";
import { type IconName } from "../icons";
import { accentVar, cx, type Accent } from "../lib";

/** Extra props (onClick, disabled, title...) go to the <button>. */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Accessible name (also used as the native tooltip). */
  label: string;
  /** sm = 26px, md = 32px, lg = 44px. */
  size?: "sm" | "md" | "lg";
  /** primary fills with the accent; plain is transparent until hover. */
  variant?: "plain" | "primary" | "outline";
  accent?: Accent;
  /** Pressed / on state for toggles like shuffle or mute. */
  active?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

/** Icon-only square button for transport controls, close buttons and toolbars. */
export function IconButton({ icon, label, size = "md", variant = "plain", accent, active, className, style, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cx("hx-iconbtn", `hx-iconbtn--${size}`, `hx-iconbtn--${variant}`, active && "is-active", className)}
      style={{ ["--hx-acc" as string]: accentVar(accent), ...style }}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
