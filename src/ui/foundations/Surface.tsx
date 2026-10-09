import { type CSSProperties, type ReactNode } from "react";
import { cx } from "../lib";

export interface SurfaceProps {
  /** Background: crust (screen), mantle (popup body), base (window body) or the aurora wallpaper. */
  tone?: "crust" | "mantle" | "base" | "wallpaper";
  /** Inner padding in px. */
  padding?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Root wrapper. Every hyprland-ui screen is dark: wrap the page or any standalone component in `<Surface>` so it sits on crust with the text colour and MonoLisa applied. */
export function Surface({ tone = "crust", padding = 24, children, className, style }: SurfaceProps) {
  return (
    <div className={cx("hx-surface", `hx-surface--${tone}`, className)} style={{ padding, ...style }}>
      {tone === "wallpaper" && (
        <div className="hx-surface-wall" aria-hidden>
          <i />
          <i />
        </div>
      )}
      <div className="hx-surface-in">{children}</div>
    </div>
  );
}
