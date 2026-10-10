import type { ReactNode } from "react";
import { cx } from "../ui";
import { wallpapers } from "./wallpapers";

export interface WallpaperGalleryProps {
  /** Selected wallpaper id. */
  selected?: string;
  onSelect?: (id: string) => void;
  /** Large cards with descriptions, or compact thumbnails. */
  size?: "large" | "compact";
  className?: string;
  /** Extra tiles after the wallpapers (e.g. an upload slot). */
  children?: ReactNode;
}

/** A gallery tile: 16:9, square, ringed. */
export const galleryTile =
  "unbutton relative aspect-video cursor-pointer overflow-hidden bg-crust font-hx text-[10px] text-text shadow-[0_0_0_1px_var(--hx-surface0)] transition-shadow duration-(--hx-fast)";

/** The bundled Arch wallpapers. Each is a generated SVG, so it is sharp at any resolution. */
export function WallpaperGallery({ selected, onSelect, size = "large", className, children }: WallpaperGalleryProps) {
  const large = size === "large";
  return (
    <div
      data-component="WallpaperGallery"
      className={cx(
        "grid",
        large ? "grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3" : "grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-1.5",
        className,
      )}
    >
      {wallpapers().map((w) => (
        <button
          key={w.id}
          type="button"
          className={cx(galleryTile, w.id === selected ? "shadow-[0_0_0_2px_var(--hx-mauve)]" : "hover:shadow-[0_0_0_1px_var(--hx-overlay0)]")}
          onClick={() => onSelect?.(w.id)}
          title={w.description}
        >
          <img src={w.url} alt={large ? w.name : ""} className="block size-full object-cover" />
          <span className={cx("absolute inset-x-0 bottom-0 bg-crust/80 text-left", large ? "px-2.5 py-1.5 text-[12px]" : "px-[5px] py-0.5")}>
            {w.name}
            {large && <small className="mt-0.5 block text-[10.5px] text-overlay1">{w.description}</small>}
          </span>
        </button>
      ))}
      {children}
    </div>
  );
}
