import type { CSSProperties, ReactNode } from "react";
import { Icon, cx, type Accent, type IconName } from "../ui";
import type { Program } from "../terminal/programs";
import { TerminalScreen } from "../terminal/terminal-emulator";

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
    <div data-component="Dolphin" className="grid h-full grid-cols-[180px_1fr] grid-rows-[34px_1fr] text-[12.5px] text-text">
      <div className="col-span-full flex items-center gap-2.5 border-b border-surface0 px-2.5 text-subtext0">
        <Icon name="chevronLeft" size={14} />
        <Icon name="chevronRight" size={14} />
        <span className="flex-1 bg-mantle px-2 py-[3px] text-text">/home/romeo</span>
        <Icon name="search" size={14} />
      </div>
      <aside className="flex flex-col gap-0.5 border-r border-surface0 px-1.5 py-2.5">
        <b className="caps px-2 pb-1.5 text-overlay1">places</b>
        {places.map(([i, n], k) => (
          <span key={n} className={cx("flex items-center gap-2 px-2 py-1", k === 0 && "bg-blue/18 text-text")}>
            <Icon name={i} size={14} /> {n}
          </span>
        ))}
      </aside>
      <main className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] content-start gap-3.5 overflow-hidden p-4">
        {files.map(([i, n]) => (
          <span key={n} className="flex flex-col items-center gap-1 text-center">
            <Icon name={i} size={34} className={i === "folder" ? "text-blue" : "text-subtext0"} />
            {n}
          </span>
        ))}
      </main>
    </div>
  );
}

function Firefox() {
  return (
    <div data-component="Firefox" className="flex h-full flex-col text-[13px] text-text">
      <div className="flex gap-0.5 bg-crust px-1.5 pt-1.5 *:bg-mantle *:px-3.5 *:py-1.5 *:text-subtext0">
        <span className="bg-base! text-text! shadow-[inset_0_2px_0_var(--hx-peach)]">Hyprland Wiki</span>
        <span>Arch Wiki — Hyprland</span>
        <span>r/unixporn</span>
      </div>
      <div className="m-1.5 flex items-center gap-2 bg-mantle px-2.5 py-1.5">
        <Icon name="lock" size={12} /> wiki.hypr.land/Configuring/Variables/
      </div>
      <article className="overflow-hidden px-7 py-2.5">
        <h1 className="my-1.5 text-[26px]">Variables</h1>
        <p className="text-overlay1">general · decoration · animations · input · gestures · group · misc · binds</p>
        <h2 className="mt-[18px] mb-2 text-[16px] text-mauve">general</h2>
        <table className="w-full border-collapse *:*:*:border-b *:*:*:border-surface0 *:*:*:px-2.5 *:*:*:py-1.5">
          <tbody>
            {[["border_size", "int", "2"], ["gaps_in", "css gaps", "3"], ["gaps_out", "css gaps", "6"], ["col.active_border", "gradient", "mauve pink yellow 45deg"], ["layout", "str", "dwindle"]].map(([a, b, c]) => (
              <tr key={a}>
                <td>{a}</td>
                <td className="text-overlay1">{b}</td>
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
      <div data-component="AppContent" className="group/term relative flex size-full flex-col overflow-hidden font-hx leading-[1.45] text-text">
        <TerminalScreen program={program} name="ghostty 1.2.1" palette style={{ "--rx-term-pad": "10px", fontSize } as CSSProperties} />
      </div>
    );
  }
  return app === "dolphin" ? <Dolphin /> : <Firefox />;
}
