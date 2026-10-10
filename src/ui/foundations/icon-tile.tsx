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
    <span className={cx("hx-tile", className)} style={{ width: size, height: size, fontSize: size * 0.55, ["--hx-acc" as string]: accentVar(accent) }}>
      <Icon name={icon} />
    </span>
  );
}
