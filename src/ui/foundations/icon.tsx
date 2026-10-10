import { type CSSProperties } from "react";
import { icons, type IconName } from "../icons";

export interface IconProps {
  /** Icon to draw, from the `icons` table. */
  name: IconName;
  /** Size in px or any CSS length. Defaults to 1em so it follows the surrounding font size. */
  size?: string | number;
  /** CSS colour. Defaults to currentColor. */
  color?: string;
  /** Accessible label; when omitted the icon is decorative (aria-hidden). */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/** Material Design icon as inline SVG. Inherits colour and font size. */
export function Icon({ name, size = "1em", color, label, className, style }: IconProps) {
  return (
    <svg
      className={"hx-icon" + (className ? " " + className : "")}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ color, ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={icons[name]} fill="currentColor" />
    </svg>
  );
}
