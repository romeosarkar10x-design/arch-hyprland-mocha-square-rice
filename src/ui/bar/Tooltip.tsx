import { Fragment, type ReactNode } from "react";
import { Icon } from "../foundations/Icon";
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
    <div className={cx("hx-tip", className)} role="tooltip" style={{ ["--hx-acc" as string]: accentVar(accent) }}>
      <div className="hx-tip-head">
        {icon && <Icon name={icon} size={18} className="hx-tip-icon" />}
        <div>
          <b>{title}</b>
          {subtitle && <small>{subtitle}</small>}
        </div>
      </div>
      {rows && rows.length > 0 && (
        <dl className="hx-tip-rows">
          {rows.map((r) => (
            <Fragment key={r.label}>
              <dt>{r.label}</dt>
              {r.bar != null ? (
                <span className="hx-tip-bar">
                  <i style={{ width: `${clamp(r.bar)}%` }} />
                </span>
              ) : (
                <span />
              )}
              <dd>{r.value}</dd>
            </Fragment>
          ))}
        </dl>
      )}
      {children && <div className="hx-tip-body">{children}</div>}
      {hints && hints.length > 0 && (
        <div className="hx-tip-foot">
          {hints.map(([k, v]) => (
            <span key={k}>
              <kbd className="hx-kbd">{k}</kbd>
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
