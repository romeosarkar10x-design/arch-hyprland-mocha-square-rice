import { wallpapers } from "./wallpapers";
import "../theme/theme.css";

export interface WallpaperGalleryProps {
  /** Selected wallpaper id. */
  selected?: string;
  onSelect?: (id: string) => void;
  /** Large cards with descriptions, or compact thumbnails. */
  size?: "large" | "compact";
  className?: string;
}

/** The bundled Arch wallpapers. Each is a generated SVG, so it is sharp at any resolution. */
export function WallpaperGallery({ selected, onSelect, size = "large", className }: WallpaperGalleryProps) {
  return (
    <div className={["rx-gal", size === "large" && "rx-gal-big", className].filter(Boolean).join(" ")}>
      {wallpapers().map((w) => (
        <button key={w.id} type="button" className={w.id === selected ? "is-active" : undefined} onClick={() => onSelect?.(w.id)} title={w.description}>
          <img src={w.url} alt={w.name} />
          <span>
            {w.name}
            {size === "large" && <small>{w.description}</small>}
          </span>
        </button>
      ))}
    </div>
  );
}
