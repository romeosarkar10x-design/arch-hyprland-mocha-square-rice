import { type CSSProperties, type ReactNode } from "react";
import { IconTile } from "../foundations/IconTile";
import { type IconName } from "../icons";
import { accentVar, cx, type Accent } from "../lib";

export interface PanelProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconName;
  /** Drives the corner brackets, the icon tile and any child that reads --hx-acc. */
  accent?: Accent;
  /** Shows a pulsing LIVE marker in the header. */
  live?: boolean;
  /** Extra header content on the right (replaces the LIVE marker). */
  headerAside?: ReactNode;
  /** Footer action row (buttons). */
  actions?: ReactNode;
  /** Width in px. */
  width?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Shell for every rich bar dropdown: mantle body, hairline frame, accent corner brackets, icon-tile header, divided sections, crust action footer. */
export function Panel({ title, subtitle, icon, accent = "mauve", live, headerAside, actions, width = 440, children, className, style }: PanelProps) {
  return (
    <section className={cx("hx-panel", className)} style={{ width, ["--hx-acc" as string]: accentVar(accent), ...style }}>
      <i className="hx-corner tl" />
      <i className="hx-corner tr" />
      <i className="hx-corner bl" />
      <i className="hx-corner br" />
      <header className="hx-panel-head">
        {icon && <IconTile icon={icon} accent={accent} />}
        <div className="hx-panel-titles">
          <div className="hx-panel-title">{title}</div>
          {subtitle && <div className="hx-panel-sub">{subtitle}</div>}
        </div>
        {headerAside ??
          (live && (
            <span className="hx-live">
              <i />
              LIVE
            </span>
          ))}
      </header>
      {children}
      {actions && <footer className="hx-panel-actions">{actions}</footer>}
    </section>
  );
}
