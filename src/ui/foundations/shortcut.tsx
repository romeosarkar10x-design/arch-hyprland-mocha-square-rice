import { Fragment } from "react";
import { Kbd } from "./kbd";
import { cx } from "../lib";

export interface ShortcutProps {
  /** Keys pressed together, e.g. ["SUPER", "R"]. */
  keys: string[];
  className?: string;
}

/** Key combination drawn as keycaps joined by +. */
export function Shortcut({ keys, className }: ShortcutProps) {
  return (
    <span className={cx("hx-shortcut", className)}>
      {keys.map((k, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="hx-shortcut-plus">+</span>}
          <Kbd>{k}</Kbd>
        </Fragment>
      ))}
    </span>
  );
}
