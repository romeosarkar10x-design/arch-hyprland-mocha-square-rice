import { Icon } from "./icon";
import { type IconName } from "../icons";
import { accentVar, cx, type Accent } from "../lib";

export interface IconTileProps {
  icon: IconName;
  accent?: Accent;
  /** Tile edge in px. */
  size?: number;
  className?: string;
}

/** Square tinted tile holding an icon, tinted by its accent. */
export function IconTile({ icon, accent = "mauve", size = 36, className }: IconTileProps) {
  return (
    <span
      data-component="IconTile"
      className={cx("kit-type inline-grid flex-none place-items-center bg-acc/14 text-acc inset-ring inset-ring-acc/32", className)}
      style={{ width: size, height: size, fontSize: size * 0.55, ["--hx-acc" as string]: accentVar(accent) }}
    >
      <Icon name={icon} />
    </span>
  );
}
