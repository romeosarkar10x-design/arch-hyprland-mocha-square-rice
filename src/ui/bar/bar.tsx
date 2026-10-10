import { type CSSProperties, type ReactNode } from "react";
import { cx } from "../lib";

export interface BarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** The top panel (Waybar): 36px crust strip with a 2px surface0 underline, three slots, centre pinned to the true middle. */
export function Bar({ left, center, right, className, style }: BarProps) {
  return (
    <header className={cx("hx-bar", className)} style={style}>
      <div className="hx-bar-left">{left}</div>
      <div className="hx-bar-center">{center}</div>
      <div className="hx-bar-right">{right}</div>
    </header>
  );
}
