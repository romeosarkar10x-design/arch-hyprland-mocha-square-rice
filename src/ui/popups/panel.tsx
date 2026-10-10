import { type CSSProperties, type ReactNode } from "react";
import { IconTile } from "../foundations/icon-tile";
import { type IconName } from "../icons";
import { accentVar, componentName, cx, type Accent, type ComponentTag } from "../lib";

export interface PanelProps extends ComponentTag {
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
export function Panel({ title, subtitle, icon, accent = "mauve", live, headerAside, actions, width = 440, children, className, style, ...tag }: PanelProps) {
  return (
    <section
      data-component={componentName("Panel", tag["data-component"])}
      className={cx("kit-type focus-ring relative bg-mantle text-[12.5px] text-text shadow-popup ring ring-surface0", className)}
      style={{ width, ["--hx-acc" as string]: accentVar(accent), ...style }}
    >
      <Corners />
      <PanelHeader title={title} subtitle={subtitle} icon={icon} accent={accent}>
        {headerAside ?? (live && <LiveBadge />)}
      </PanelHeader>
      {children}
      {actions && <PanelActions>{actions}</PanelActions>}
    </section>
  );
}

interface PanelHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconName;
  accent: Accent;
  /** Right-hand content. */
  children?: ReactNode;
}

function PanelHeader({ title, subtitle, icon, accent, children }: PanelHeaderProps) {
  return (
    <header data-component="PanelHeader" className="flex items-center gap-3 border-b border-surface0 px-4 py-3.5">
      {icon && <IconTile icon={icon} accent={accent} />}
      <div className="min-w-0 flex-1">
        <div className="text-[14px] leading-[1.25] font-bold">{title}</div>
        {subtitle && <div className="mt-0.5 overflow-hidden text-[11px] text-ellipsis whitespace-nowrap text-subtext0">{subtitle}</div>}
      </div>
      {children}
    </header>
  );
}

/** Pulsing green LIVE marker. */
export function LiveBadge() {
  return (
    <span data-component="LiveBadge" className="inline-flex items-center gap-1.5 text-[9.5px] tracking-[.18em] text-green">
      <i className="size-1.5 animate-pulse bg-green" />
      LIVE
    </span>
  );
}

/** Crust footer row for a panel's buttons. */
export function PanelActions({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <footer data-component="PanelActions" className={cx("flex items-center gap-2 border-t border-surface0 bg-crust px-4 py-2.5", className)}>
      {children}
    </footer>
  );
}

const corner = "pointer-events-none absolute z-1 size-3 border-0 border-solid border-acc";

/** The four accent corner brackets of a popup. Place inside a `relative` box that sets `--hx-acc`. */
export function Corners() {
  return (
    <span data-component="Corners" className="contents">
      <i className={cx(corner, "-top-px -left-px border-t-2 border-l-2")} />
      <i className={cx(corner, "-top-px -right-px border-t-2 border-r-2")} />
      <i className={cx(corner, "-bottom-px -left-px border-b-2 border-l-2")} />
      <i className={cx(corner, "-right-px -bottom-px border-r-2 border-b-2")} />
    </span>
  );
}
