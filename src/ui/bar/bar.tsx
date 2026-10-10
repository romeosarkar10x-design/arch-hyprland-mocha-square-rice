import { type CSSProperties, type ReactNode } from "react";
import { componentName, cx, type ComponentTag } from "../lib";

export interface BarProps extends ComponentTag {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** The top panel (Waybar): 36px crust strip with a 2px surface0 underline, three slots, centre pinned to the true middle. */
export function Bar({ left, center, right, className, style, ...tag }: BarProps) {
  return (
    <header
      data-component={componentName("Bar", tag["data-component"])}
      className={cx(
        "kit-type focus-ring relative grid h-[calc(var(--hx-bar-height)+var(--hx-border-bar))] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch",
        "border-b-(length:--hx-border-bar) border-surface0 bg-bar-ground text-[13.5px] text-text select-none backdrop-blur-[14px] backdrop-saturate-[1.3]",
        className,
      )}
      style={style}
    >
      <div className="flex min-w-0 items-stretch overflow-hidden">{left}</div>
      <div className="flex min-w-0 items-stretch overflow-hidden">{center}</div>
      <div className="flex min-w-0 items-stretch justify-end overflow-hidden *:flex-none">{right}</div>
    </header>
  );
}
