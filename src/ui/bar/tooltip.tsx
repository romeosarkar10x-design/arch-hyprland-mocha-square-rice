import { Fragment, type ReactNode } from "react";
import { Icon } from "../foundations/icon";
import { Kbd } from "../foundations/kbd";
import { type IconName } from "../icons";
import { accentVar, clamp, cx, type Accent } from "../lib";

export interface TooltipRow {
  label: string;
  value: ReactNode;
  /** Optional 0-100 fill drawn between label and value. */
  bar?: number;
}

export interface TooltipProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Colour of the 3px top strip, title and inline bars. */
  accent?: Accent;
  rows?: TooltipRow[];
  /** Mouse/keyboard hints in the footer, e.g. [["click", "btop"], ["scroll", "volume"]]. */
  hints?: [string, string][];
  children?: ReactNode;
  className?: string;
}

/** Hover card for a bar segment: 3px accent strip on top, key/value rows (optional inline bars), hint footer. */
export function Tooltip({ title, subtitle, icon, accent = "mauve", rows, hints, children, className }: TooltipProps) {
  return (
    <div
      data-component="Tooltip"
      className={cx(
        "kit-type w-[280px] border border-t-(length:--hx-strip) border-surface1 border-t-acc bg-mantle text-[12.5px] text-text shadow-popup",
        className,
      )}
      role="tooltip"
      style={{ ["--hx-acc" as string]: accentVar(accent) }}
    >
      <div className="flex items-center gap-2.5 border-b border-surface0 px-3 py-2.5">
        {icon && <Icon name={icon} size={18} className="text-acc" />}
        <div>
          <b className="block text-[13px] text-acc">{title}</b>
          {subtitle && <small className="mt-px block text-[11px] text-subtext0">{subtitle}</small>}
        </div>
      </div>
      {rows && rows.length > 0 && (
        <dl className="m-0 grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-[7px] px-3 py-2.5">
          {rows.map((r) => (
            <Fragment key={r.label}>
              <dt className="text-subtext0">{r.label}</dt>
              {r.bar != null ? (
                <span className="relative h-1 bg-surface0">
                  <i className="absolute inset-y-0 left-0 bg-acc" style={{ width: `${clamp(r.bar)}%` }} />
                </span>
              ) : (
                <span />
              )}
              <dd className="m-0 text-right">{r.value}</dd>
            </Fragment>
          ))}
        </dl>
      )}
      {children && <div className="px-3 py-2.5">{children}</div>}
      {hints && hints.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 border-t border-surface0 bg-crust px-3 py-2 text-[11px] text-overlay1">
          {hints.map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Kbd>{k}</Kbd>
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
