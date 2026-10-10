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
      className={cx("hx-wall", `hx-wall--${variant}`, className)}
      style={variant === "image" && src ? { backgroundImage: `url(${src})`, ...style } : style}
      aria-hidden
    >
      {variant === "aurora" && (
        <>
          <i className="hx-wall-glow a" />
          <i className="hx-wall-glow b" />
          <i className="hx-wall-glow c" />
          <i className="hx-wall-grid" />
          <span className="hx-wall-mark">
            <Icon name="arch" />
          </span>
        </>
      )}
      {variant === "tiles" && (
        <div className="hx-wall-tiles">
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
