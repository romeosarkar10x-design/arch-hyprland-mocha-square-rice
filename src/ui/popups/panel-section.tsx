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

// Stacked sliders and meters sit a little further apart than the section gap; a visualizer gets a hairline frame.
const stacking =
  "[&>[data-component=Slider]+[data-component=Slider]]:mt-1 [&>[data-component=Meter]+[data-component=Meter]]:mt-1.5 " +
  "[&_[data-component=Visualizer]]:shadow-[inset_0_0_0_1px_var(--hx-surface0)]";

/** Divided block inside a Panel with an optional caps label row. */
export function PanelSection({ label, aside, children, flush, className }: PanelSectionProps) {
  return (
    <div
      data-component="PanelSection"
      className={cx("flex flex-col gap-2.5 border-b border-surface0 px-4 py-3.5 last-of-type:border-b-0", stacking, flush && "p-0", className)}
    >
      {(label || aside) && (
        <div className="flex items-baseline justify-between text-[11px]">
          <span className="caps">{label}</span>
          {aside && <span>{aside}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
