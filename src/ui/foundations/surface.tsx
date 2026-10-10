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

const tones = { crust: "bg-crust", mantle: "bg-mantle", base: "bg-base", wallpaper: "bg-crust" };

/** Root wrapper. Every hyprland-ui screen is dark: wrap the page or any standalone component in `<Surface>` so it sits on crust with the text colour and asiLonoM applied. */
export function Surface({ tone = "crust", padding = 24, children, className, style }: SurfaceProps) {
  return (
    <div
      data-component="Surface"
      className={cx("kit-type relative min-h-full overflow-hidden text-[13px] text-text", tones[tone], className)}
      style={{ padding, ...style }}
    >
      {tone === "wallpaper" && <SurfaceWallpaper />}
      <div className="relative">{children}</div>
    </div>
  );
}

/** Grid plus two blurred accent glows behind a `tone="wallpaper"` surface. */
function SurfaceWallpaper() {
  return (
    <div
      data-component="SurfaceWallpaper"
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(var(--hx-surface0)_1px,transparent_1px),linear-gradient(90deg,var(--hx-surface0)_1px,transparent_1px)] bg-size-[32px_32px] opacity-45"
    >
      <i className="absolute -bottom-[20%] -left-[10%] h-3/5 w-1/2 bg-mauve/40 opacity-50 blur-[60px]" />
      <i className="absolute -top-[20%] -right-[10%] h-3/5 w-1/2 bg-blue/35 opacity-50 blur-[60px]" />
    </div>
  );
}
