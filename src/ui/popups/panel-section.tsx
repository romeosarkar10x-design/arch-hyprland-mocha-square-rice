import { type ReactNode } from "react";
import { cx } from "../lib";

export interface PanelSectionProps {
  /** Small caps label at the top-left. */
  label?: ReactNode;
  /** Right side of the label row, e.g. a figure or a toggle. */
  aside?: ReactNode;
  children?: ReactNode;
  /** Remove the inner padding (for edge-to-edge content). */
  flush?: boolean;
  className?: string;
}

/** Divided block inside a Panel with an optional caps label row. */
export function PanelSection({ label, aside, children, flush, className }: PanelSectionProps) {
  return (
    <div className={cx("hx-section", flush && "is-flush", className)}>
      {(label || aside) && (
        <div className="hx-section-label">
          <span className="hx-caps">{label}</span>
          {aside && <span className="hx-section-aside">{aside}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
