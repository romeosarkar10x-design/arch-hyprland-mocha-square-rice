import { type CSSProperties, type ReactNode } from "react";
import { cx } from "../lib";

export interface WindowFrameProps {
  /** Focused windows get the animated mauve → pink → yellow border and the drop shadow. */
  focused?: boolean;
  /** Small class label on the bottom-right corner (dev aid, like hyprctl clients). */
  tag?: string;
  children?: ReactNode;
  onFocus?: () => void;
  className?: string;
  style?: CSSProperties;
}

/** A Hyprland client: no titlebar, 2px border. Focused = rotating mauve→pink→yellow conic border + shadow; unfocused = dimmed body. */
export function WindowFrame({ focused, tag, children, onFocus, className, style }: WindowFrameProps) {
  return (
    <div className={cx("hx-win", focused && "is-focused", className)} style={style} onPointerDown={onFocus}>
      <div className="hx-win-in">
        {children}
        {tag && <span className="hx-win-tag">{tag}</span>}
      </div>
    </div>
  );
}
