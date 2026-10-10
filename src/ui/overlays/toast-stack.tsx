import { type CSSProperties, type ReactNode } from "react";
import { cx } from "../lib";

export interface ToastStackProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Column of toasts, 8px apart; the Desktop pins it top-right under the bar. */
export function ToastStack({ children, className, style }: ToastStackProps) {
  return (
    <div className={cx("hx-toasts", className)} style={style}>
      {children}
    </div>
  );
}
