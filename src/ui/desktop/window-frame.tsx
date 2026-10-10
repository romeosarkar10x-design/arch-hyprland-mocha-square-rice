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
  /** Classes for the client area inside the border (e.g. `bg-transparent` for a see-through terminal). */
  bodyClassName?: string;
  style?: CSSProperties;
}

/** A Hyprland client: no titlebar, 2px border. Focused = rotating mauve→pink→yellow conic border + shadow; unfocused = dimmed body. */
export function WindowFrame({ focused, tag, children, onFocus, className, bodyClassName, style }: WindowFrameProps) {
  return (
    <div
      data-component="WindowFrame"
      className={cx(
        "kit-type absolute bg-border-inactive p-(--hx-border-window) text-text transition-[left,top,width,height] duration-(--hx-slow) ease-hx",
        focused &&
          "z-1 animate-spin bg-[conic-gradient(from_var(--hx-angle),var(--hx-mauve),var(--hx-pink),var(--hx-yellow),var(--hx-pink),var(--hx-mauve))] shadow-window",
        className,
      )}
      style={style}
      onPointerDown={onFocus}
    >
      <div
        className={cx(
          "relative size-full overflow-hidden bg-base/94 transition-[filter,opacity] duration-(--hx-med)",
          !focused && "opacity-94 brightness-[.92] saturate-[.9]",
          bodyClassName,
        )}
      >
        {children}
        {tag && <span className="pointer-events-none absolute right-1.5 bottom-1 text-[9.5px] text-surface2">{tag}</span>}
      </div>
    </div>
  );
}
