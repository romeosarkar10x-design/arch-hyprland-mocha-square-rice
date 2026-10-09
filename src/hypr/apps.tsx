import type { CSSProperties, ReactNode } from "react";
import { Icon, type Accent, type IconName } from "../ds";
import { renderProgram, type Program } from "../terminal/programs";
import "../terminal/terminal.css";

export type AppId = "ghostty" | "btop" | "nvim" | "yazi" | "pacman" | "fastfetch" | "dolphin" | "firefox";

export interface AppInfo {
  name: string;
  /** `hyprctl clients` class. */
  cls: string;
  icon: IconName;
  accent: Accent;
  title: string;
}

export const APPS: Record<AppId, AppInfo> = {
  ghostty: { name: "Ghostty", cls: "com.mitchellh.ghostty", icon: "ghostty", accent: "mauve", title: "romeo@archlinux: ~" },
  fastfetch: { name: "fastfetch", cls: "com.mitchellh.ghostty", icon: "ghostty", accent: "mauve", title: "fastfetch" },
  btop: { name: "btop", cls: "com.mitchellh.ghostty", icon: "cpu", accent: "green", title: "btop" },
  nvim: { name: "Neovim", cls: "nvim", icon: "code", accent: "green", title: "palette.ts — nvim" },
  yazi: { name: "yazi", cls: "com.mitchellh.ghostty", icon: "folder", accent: "yellow", title: "yazi ~/github" },
  pacman: { name: "pacman", cls: "com.mitchellh.ghostty", icon: "download", accent: "blue", title: "sudo pacman -Syu" },
  dolphin: { name: "Dolphin", cls: "org.kde.dolphin", icon: "folder", accent: "blue", title: "Home — Dolphin" },
  firefox: { name: "Firefox", cls: "firefox", icon: "firefox", accent: "peach", title: "Hyprland Wiki — Mozilla Firefox" },
};

const PROGRAM: Partial<Record<AppId, Program>> = {
  ghostty: "shell", fastfetch: "fastfetch", btop: "btop", nvim: "nvim", yazi: "yazi", pacman: "pacman",
};

function Dolphin() {
  const places: [IconName, string][] = [["account", "Home"], ["note", "Documents"], ["download", "Downloads"], ["image", "Pictures"], ["music", "Music"], ["disk", "Root"]];
  const files: [IconName, string][] = [
    ["folder", ".config"], ["folder", "github"], ["folder", "Documents"], ["folder", "Downloads"], ["folder", "Pictures"],
    ["folder", "Music"], ["note", "notes.md"], ["image", "wall.png"], ["terminal", "install.sh"], ["note", "todo.txt"],
  ];
  return (
    <div className="rx-app-files">
      <div className="rx-app-files-bar">
        <Icon name="chevronLeft" size={14} />
        <Icon name="chevronRight" size={14} />
        <span className="rx-app-files-path">/home/romeo</span>
        <Icon name="search" size={14} />
      </div>
      <aside>
        <b className="hx-caps">places</b>
        {places.map(([i, n], k) => (
          <span key={n} className={k === 0 ? "is-active" : undefined}>
            <Icon name={i} size={14} /> {n}
          </span>
        ))}
      </aside>
      <main>
        {files.map(([i, n]) => (
          <span key={n}>
            <Icon name={i} size={34} className={i === "folder" ? "hx-blue" : "hx-subtext"} />
            {n}
          </span>
        ))}
      </main>
    </div>
  );
}

function Firefox() {
  return (
    <div className="rx-app-web">
      <div className="rx-app-web-tabs">
        <span className="is-active">Hyprland Wiki</span>
        <span>Arch Wiki — Hyprland</span>
        <span>r/unixporn</span>
      </div>
      <div className="rx-app-web-url">
        <Icon name="lock" size={12} /> wiki.hypr.land/Configuring/Variables/
      </div>
      <article>
        <h1>Variables</h1>
        <p className="hx-faint">general · decoration · animations · input · gestures · group · misc · binds</p>
        <h2>general</h2>
        <table>
          <tbody>
            {[["border_size", "int", "2"], ["gaps_in", "css gaps", "3"], ["gaps_out", "css gaps", "6"], ["col.active_border", "gradient", "mauve pink yellow 45deg"], ["layout", "str", "dwindle"]].map(([a, b, c]) => (
              <tr key={a}>
                <td>{a}</td>
                <td className="hx-faint">{b}</td>
                <td>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Hyprland is a dynamic tiling Wayland compositor that doesn't sacrifice on its looks.</p>
      </article>
    </div>
  );
}

/** What a window shows: a terminal program, Dolphin or Firefox. Transparent, so the window's blur shows. */
export function AppContent({ app, fontSize = 11.5 }: { app: AppId; fontSize?: number }): ReactNode {
  const program = PROGRAM[app];
  if (program) {
    return (
      <div className="rx-temu" style={{ "--rx-term-alpha": "0%", "--rx-term-pad": "10px", fontSize, background: "none", backdropFilter: "none" } as CSSProperties}>
        <div className="rx-temu-body">{renderProgram(program, "ghostty 1.2.1")}</div>
      </div>
    );
  }
  return app === "dolphin" ? <Dolphin /> : <Firefox />;
}
