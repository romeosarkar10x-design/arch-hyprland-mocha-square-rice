import { type ReactNode } from "react";
import { cx } from "../lib";

export interface KeyValueListProps {
  /** Alternating `<dt>` / `<dd>` pairs. */
  children?: ReactNode;
  className?: string;
}

/** Two-column definition list: dim keys on the left, values flush right. */
export function KeyValueList({ children, className }: KeyValueListProps) {
  return (
    <dl
      data-component="KeyValueList"
      className={cx("m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[12px] [&_dd]:m-0 [&_dd]:text-right [&_dt]:text-subtext0", className)}
    >
      {children}
    </dl>
  );
}
