import type { ReactNode } from "react";
import { Wallpaper } from "../ui";
import "./shell.css";

export interface StageProps {
  children?: ReactNode;
  /** Where the overlay sits on the screen. */
  place?: "center" | "top" | "bottom" | "top-right" | "right";
  /** Dim + blur the wallpaper like a layer-shell scrim. */
  scrim?: boolean;
  width?: number | string;
  height?: number | string;
}

/** A screen-sized wallpaper backdrop for showing an overlay where it would appear on the desktop. */
export function Stage({ children, place = "center", scrim = false, width = "100%", height = 640 }: StageProps) {
  return (
    <div className={`rx-stage rx-stage--${place}`} style={{ width, height }}>
      <Wallpaper variant="image" />
      {scrim && <div className="rx-stage-scrim" />}
      <div className="rx-stage-slot">{children}</div>
    </div>
  );
}
