import { Icon } from "../foundations/icon";
import { cx } from "../lib";

export interface BrowserViewProps {
  url?: string;
  tabs?: string[];
  className?: string;
}

/** Chrome-style body (tabs, omnibox, repo file list) for browser windows in mock-ups. */
export function BrowserView({
  url = "github.com/romeosarkar10x/dotfiles",
  tabs = ["romeosarkar10x/dotfiles", "Hyprland Wiki — Lua config", "catppuccin/catppuccin"],
  className,
}: BrowserViewProps) {
  return (
    <div data-component="BrowserView" className={cx("kit-type absolute inset-0 flex flex-col text-[12px] text-text", className)}>
      <div className="flex items-end gap-px bg-crust px-1.5 pt-1.5">
        {tabs.map((t, i) => (
          <span
            key={t}
            className={cx(
              "flex max-w-[220px] items-center gap-2 overflow-hidden px-3 py-[7px] text-ellipsis whitespace-nowrap",
              i === 0 ? "bg-base text-text shadow-[inset_0_2px_0_var(--hx-blue)]" : "bg-mantle text-subtext0",
            )}
          >
            <Icon name={i === 0 ? "github" : i === 1 ? "globe" : "palette"} />
            {t}
          </span>
        ))}
        <Icon name="plus" className="mx-2 mb-2 text-overlay1" />
      </div>
      <div className="mx-2 my-1.5 flex items-center gap-2 bg-mantle px-2.5 py-1.5 text-subtext0">
        <Icon name="lock" className="text-green" />
        <span>{url}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 px-[26px] py-[18px]">
        <div className="flex items-center gap-1.5 text-[15px]">
          <Icon name="branch" /> <b className="text-blue">romeosarkar10x</b>
          {" / "}
          <b className="text-blue">dotfiles</b> <span className="px-[7px] py-px text-[10px] text-subtext0 inset-ring inset-ring-surface1">Public</span>
        </div>
        <div className="ring ring-surface0">
          {(
            [
              ["folder", "bash", "Updated prompt"],
              ["folder", "design", "hyprland-ui design system"],
              ["folder", "ghostty", "asiLonoM 13"],
              ["folder", "hyprland", "Started using hyprland.lua"],
              ["folder", "nvim", "Disabled neo_tree's new tab mapping"],
              ["folder", "quickshell", "Popups"],
              ["folder", "waybar", "Ricing waybar!"],
              ["note", "README.md", "Initial commit"],
            ] as const
          ).map(([ic, n, m]) => (
            <div key={n} className="grid grid-cols-[18px_160px_1fr] items-center gap-2.5 border-surface0 px-3 py-2 not-first:border-t">
              <Icon name={ic} className={ic === "folder" ? "text-blue" : "text-overlay1"} />
              <span>{n}</span>
              <span className="text-overlay1">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
