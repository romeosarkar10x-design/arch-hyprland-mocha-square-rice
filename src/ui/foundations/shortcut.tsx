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
    <span data-component="Shortcut" className={cx("kit-type inline-flex items-center gap-[3px] text-text", className)}>
      {keys.map((k, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="text-[10px] text-overlay0">+</span>}
          <Kbd>{k}</Kbd>
        </Fragment>
      ))}
    </span>
  );
}
