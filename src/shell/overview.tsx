import { useState } from "react";
import { Icon, Wallpaper, cx } from "../ui";
import { demoWorkspaces, type DemoWorkspace } from "./windows";

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
    <div data-component="Overview" className={cx("kit-type relative max-w-full overflow-hidden bg-crust text-text", className)} style={{ width, height }}>
      <Wallpaper variant="image" className="-inset-10 blur-[14px] saturate-[1.1]" />
      <div className="absolute inset-0 bg-crust/70 backdrop-blur-[6px]" />
      <div className="absolute inset-[48px_64px_56px] grid content-center gap-[18px]" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {workspaces.map((ws) => (
          <WorkspaceThumb
            key={ws.id}
            workspace={ws}
            active={ws.id === active}
            onClick={() => {
              setActive(ws.id);
              onSelect?.(ws.id);
            }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-[18px] text-center text-[11px] text-overlay1">click a workspace · SUPER + TAB to close</div>
    </div>
  );
}

/** One workspace as a miniature: wallpaper, window outlines with app icons, number tab. */
function WorkspaceThumb({ workspace: ws, active, onClick }: { workspace: DemoWorkspace; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      data-component="WorkspaceThumb"
      className={cx(
        "unbutton relative aspect-video cursor-pointer overflow-hidden bg-crust font-hx text-[10px] text-text ring ring-surface0",
        "transition-[box-shadow,transform] hover:ring-2 hover:ring-overlay0",
        active && "shadow-[0_0_24px_color-mix(in_srgb,var(--hx-mauve)_30%,transparent)] ring-2 ring-mauve hover:ring-mauve",
      )}
      onClick={onClick}
    >
      <Wallpaper variant="image" />
      {ws.windows.map((w, i) => (
        <span
          key={w.id}
          className={cx(
            "absolute flex flex-col items-center justify-center gap-1.5 bg-base/90 text-acc inset-ring",
            active && i === 0 ? "inset-ring-mauve" : "inset-ring-surface1",
          )}
          style={{
            left: `calc(${w.box[0] * 100}% + 3px)`,
            top: `calc(${w.box[1] * 100}% + 3px)`,
            width: `calc(${w.box[2] * 100}% - 6px)`,
            height: `calc(${w.box[3] * 100}% - 6px)`,
            ["--hx-acc" as string]: `var(--hx-${w.accent})`,
          }}
        >
          <Icon name={w.icon} size={22} />
          <span className="text-overlay1">{w.cls}</span>
        </span>
      ))}
      {ws.windows.length === 0 && <span className="absolute inset-0 grid place-items-center tracking-[.2em] text-overlay0">empty</span>}
      <span
        className={cx(
          "absolute top-0 left-0 grid h-[22px] min-w-[22px] place-items-center text-[11px] font-bold",
          active ? "bg-mauve text-crust" : "bg-crust text-subtext0",
        )}
      >
        {ws.id}
      </span>
    </button>
  );
}
