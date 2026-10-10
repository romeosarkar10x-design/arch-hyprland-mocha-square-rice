import { useState } from "react";
import { Icon, Wallpaper } from "../ui";
import { demoWorkspaces, type DemoWorkspace } from "./windows";
import "./shell.css";

export interface OverviewProps {
  workspaces?: DemoWorkspace[];
  active?: number;
  /** Grid columns. */
  columns?: number;
  onSelect?: (workspace: number) => void;
  width?: number | string;
  height?: number | string;
  className?: string;
}

/** Workspace overview (hyprexpo / hyprspace): every workspace as a live miniature, click to jump. */
export function Overview({ workspaces = demoWorkspaces, active: initial = 1, columns = 3, onSelect, width = 1280, height = 720, className }: OverviewProps) {
  const [active, setActive] = useState(initial);
  return (
    <div className={["rx-ovw", className].filter(Boolean).join(" ")} style={{ width, height }}>
      <Wallpaper variant="image" className="rx-lock-wall" />
      <div className="rx-ovw-scrim" />
      <div className="rx-ovw-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            type="button"
            className={["rx-ovw-ws", ws.id === active && "is-active"].filter(Boolean).join(" ")}
            onClick={() => {
              setActive(ws.id);
              onSelect?.(ws.id);
            }}
          >
            <Wallpaper variant="image" />
            {ws.windows.map((w) => (
              <span
                key={w.id}
                className="rx-ovw-win"
                style={{
                  left: `calc(${w.box[0] * 100}% + 3px)`,
                  top: `calc(${w.box[1] * 100}% + 3px)`,
                  width: `calc(${w.box[2] * 100}% - 6px)`,
                  height: `calc(${w.box[3] * 100}% - 6px)`,
                  ["--hx-acc" as string]: `var(--hx-${w.accent})`,
                }}
              >
                <Icon name={w.icon} size={22} />
                <span>{w.cls}</span>
              </span>
            ))}
            {ws.windows.length === 0 && <span className="rx-ovw-empty">empty</span>}
            <span className="rx-ovw-num">{ws.id}</span>
          </button>
        ))}
      </div>
      <div className="rx-ovw-hint hx-faint">click a workspace · SUPER + TAB to close</div>
    </div>
  );
}
