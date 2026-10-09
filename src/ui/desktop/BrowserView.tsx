import { Icon } from "../foundations/Icon";
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
    <div className={cx("hx-browser", className)}>
      <div className="hx-browser-tabs">
        {tabs.map((t, i) => (
          <span key={t} className={cx("hx-browser-tab", i === 0 && "is-active")}>
            <Icon name={i === 0 ? "github" : i === 1 ? "globe" : "palette"} />
            {t}
          </span>
        ))}
        <Icon name="plus" className="hx-faint" />
      </div>
      <div className="hx-browser-bar">
        <Icon name="lock" className="hx-green" />
        <span>{url}</span>
      </div>
      <div className="hx-browser-page">
        <div className="hx-browser-repo">
          <Icon name="branch" /> <b className="hx-blue">romeosarkar10x</b>
          {" / "}
          <b className="hx-blue">dotfiles</b> <span className="hx-browser-pill">Public</span>
        </div>
        <div className="hx-browser-files">
          {(
            [
              ["folder", "bash", "Updated prompt"],
              ["folder", "design", "hyprland-ui design system"],
              ["folder", "ghostty", "MonoLisa 13"],
              ["folder", "hyprland", "Started using hyprland.lua"],
              ["folder", "nvim", "Disabled neo_tree's new tab mapping"],
              ["folder", "quickshell", "Popups"],
              ["folder", "waybar", "Ricing waybar!"],
              ["note", "README.md", "Initial commit"],
            ] as const
          ).map(([ic, n, m]) => (
            <div key={n} className="hx-browser-file">
              <Icon name={ic} className={ic === "folder" ? "hx-blue" : "hx-faint"} />
              <span>{n}</span>
              <span className="hx-faint">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
