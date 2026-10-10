import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { Icon } from "../foundations/icon";
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

const sizes = {
  sm: "size-[26px] text-[15px]",
  md: "size-8 text-[18px]",
  lg: "size-11 text-[24px]",
};

const variants = {
  plain: "",
  outline: "inset-ring inset-ring-surface1",
  primary: "bg-acc text-crust hover:bg-[color-mix(in_srgb,var(--hx-acc)_82%,white)] hover:text-crust",
};

/** Icon-only square button for transport controls, close buttons and toolbars. */
export function IconButton({ icon, label, size = "md", variant = "plain", accent, active, className, style, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      data-component="IconButton"
      className={cx(
        "unbutton kit-type inline-grid cursor-pointer place-items-center bg-transparent text-subtext0",
        "transition-[background-color,color] hover:bg-surface0 hover:text-text active:scale-[.94]",
        sizes[size],
        variants[variant],
        active && "text-acc hover:text-acc",
        className,
      )}
      style={{ ["--hx-acc" as string]: accentVar(accent), ...style }}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
