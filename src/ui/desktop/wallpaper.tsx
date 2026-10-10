import { type CSSProperties } from "react";
import { Icon } from "../foundations/icon";
import { cx } from "../lib";

export interface WallpaperProps {
  /** aurora = soft mauve/blue glows over a square grid; tiles = dwindle blocks; image = `src`. */
  variant?: "image" | "aurora" | "tiles";
  src?: string;
  className?: string;
  style?: CSSProperties;
}

/** Generated background: aurora (soft glows over a square grid with a faint Arch mark), tiles (dwindle blocks) or an image. */
export function Wallpaper({ variant = "aurora", src, className, style }: WallpaperProps) {
  return (
    <div
      data-component="Wallpaper"
      data-variant={variant}
      className={cx("absolute inset-0 overflow-hidden bg-crust bg-cover bg-center", variant === "image" && "wallpaper-image", className)}
      style={variant === "image" && src ? { backgroundImage: `url(${src})`, ...style } : style}
      aria-hidden
    >
      {variant === "aurora" && <Aurora />}
      {variant === "tiles" && (
        <div className="absolute inset-0 grid grid-cols-[2fr_1fr_1fr] grid-rows-3 gap-1.5 p-1.5">
          <i className="row-span-3 bg-[color-mix(in_srgb,var(--hx-mauve)_18%,var(--hx-mantle))]" />
          <i className="col-span-2 bg-[color-mix(in_srgb,var(--hx-pink)_10%,var(--hx-mantle))]" />
          <i className="bg-mantle" />
          <i className="bg-mantle" />
          <i className="bg-[color-mix(in_srgb,var(--hx-yellow)_10%,var(--hx-mantle))]" />
          <i className="bg-mantle" />
          <i className="bg-mantle" />
        </div>
      )}
    </div>
  );
}

const glow = "absolute opacity-55 blur-[80px]";

/** Three drifting accent glows over a faded square grid, with a faint Arch mark. */
function Aurora() {
  return (
    <div data-component="Aurora" className="contents">
      <i className={cx(glow, "top-[30%] -left-[8%] h-3/5 w-[55%] animate-[hx-drift_26s_ease-in-out_infinite_alternate] bg-mauve/45")} />
      <i className={cx(glow, "-top-[10%] -right-[6%] h-[55%] w-[45%] animate-[hx-drift_32s_ease-in-out_infinite_alternate-reverse] bg-blue/40")} />
      <i className={cx(glow, "right-[22%] -bottom-[10%] h-[35%] w-[30%] animate-[hx-drift_22s_ease-in-out_infinite_alternate] bg-pink/30")} />
      <i className="absolute inset-0 bg-[linear-gradient(var(--hx-surface0)_1px,transparent_1px),linear-gradient(90deg,var(--hx-surface0)_1px,transparent_1px)] bg-size-[48px_48px] opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] text-[220px] leading-[0] text-mauve opacity-[.08]">
        <Icon name="arch" />
      </span>
    </div>
  );
}
