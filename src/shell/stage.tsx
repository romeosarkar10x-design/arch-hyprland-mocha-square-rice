import type { ReactNode } from "react";
import { Wallpaper, cx } from "../ui";

export interface StageProps {
  children?: ReactNode;
  /** Where the overlay sits on the screen. */
  place?: "center" | "top" | "bottom" | "top-right" | "right";
  /** Dim + blur the wallpaper like a layer-shell scrim. */
  scrim?: boolean;
  width?: number | string;
  height?: number | string;
}

const places = {
  center: "items-center justify-center p-6",
  top: "items-start justify-center p-0",
  bottom: "items-end justify-center p-6 pb-[72px]",
  "top-right": "items-start justify-end p-2.5",
  right: "items-stretch justify-end p-2.5",
};

/** A screen-sized wallpaper backdrop for showing an overlay where it would appear on the desktop. */
export function Stage({ children, place = "center", scrim = false, width = "100%", height = 640 }: StageProps) {
  return (
    <div data-component="Stage" className="relative max-w-full overflow-hidden bg-crust" style={{ width, height }}>
      <Wallpaper variant="image" />
      {scrim && <div className="absolute inset-0 bg-crust/55 backdrop-blur-[4px]" />}
      <div className={cx("absolute inset-0 flex", places[place])}>{children}</div>
    </div>
  );
}
