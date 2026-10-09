import { useState } from "react";
import { Icon, Shortcut, type IconName } from "../ds";
import "./shell.css";

export interface Keybind {
  keys: string[];
  action: string;
  /** The hyprland.conf dispatcher, shown dimmed. */
  dispatch?: string;
}

export interface KeybindGroup {
  title: string;
  icon: IconName;
  binds: Keybind[];
}

export const defaultKeybinds: KeybindGroup[] = [
  {
    title: "Apps",
    icon: "app",
    binds: [
      { keys: ["SUPER", "⏎"], action: "Terminal", dispatch: "exec ghostty" },
      { keys: ["SUPER", "R"], action: "App launcher", dispatch: "exec rofi -show drun" },
      { keys: ["SUPER", "D"], action: "dmenu run", dispatch: "exec dmenu_run" },
      { keys: ["SUPER", "B"], action: "Browser", dispatch: "exec google-chrome" },
      { keys: ["SUPER", "E"], action: "Files", dispatch: "exec ghostty -e yazi" },
      { keys: ["SUPER", "V"], action: "Clipboard history", dispatch: "exec cliphist list | rofi" },
    ],
  },
  {
    title: "Windows",
    icon: "monitor",
    binds: [
      { keys: ["SUPER", "Q"], action: "Close", dispatch: "killactive" },
      { keys: ["SUPER", "F"], action: "Fullscreen", dispatch: "fullscreen" },
      { keys: ["SUPER", "SPACE"], action: "Toggle floating", dispatch: "togglefloating" },
      { keys: ["SUPER", "H J K L"], action: "Move focus", dispatch: "movefocus" },
      { keys: ["SUPER", "SHIFT", "H J K L"], action: "Move window", dispatch: "movewindow" },
      { keys: ["ALT", "TAB"], action: "Switch window", dispatch: "cyclenext" },
    ],
  },
  {
    title: "Workspaces",
    icon: "more",
    binds: [
      { keys: ["SUPER", "1–9"], action: "Go to workspace", dispatch: "workspace N" },
      { keys: ["SUPER", "SHIFT", "1–9"], action: "Move to workspace", dispatch: "movetoworkspace N" },
      { keys: ["SUPER", "TAB"], action: "Overview", dispatch: "hyprexpo:expo toggle" },
      { keys: ["SUPER", "S"], action: "Scratchpad", dispatch: "togglespecialworkspace" },
    ],
  },
  {
    title: "System",
    icon: "settings",
    binds: [
      { keys: ["SUPER", "L"], action: "Lock", dispatch: "exec hyprlock" },
      { keys: ["SUPER", "ESC"], action: "Power menu", dispatch: "exec wlogout" },
      { keys: ["SUPER", "N"], action: "Notifications", dispatch: "exec swaync-client -t" },
      { keys: ["PRINT"], action: "Screenshot region", dispatch: "exec hyprshot -m region" },
      { keys: ["SUPER", "SHIFT", "C"], action: "Pick colour", dispatch: "exec hyprpicker -a" },
      { keys: ["SUPER", "SHIFT", "W"], action: "Next wallpaper + retheme", dispatch: "exec rice-theme next" },
    ],
  },
  {
    title: "Media",
    icon: "music",
    binds: [
      { keys: ["XF86AudioRaiseVolume"], action: "Volume up", dispatch: "exec swayosd-client --output-volume +5" },
      { keys: ["XF86AudioMute"], action: "Mute", dispatch: "exec swayosd-client --output-volume mute-toggle" },
      { keys: ["XF86AudioPlay"], action: "Play / pause", dispatch: "exec playerctl play-pause" },
      { keys: ["XF86MonBrightnessUp"], action: "Brightness up", dispatch: "exec swayosd-client --brightness +5" },
    ],
  },
];

export interface KeybindCheatsheetProps {
  groups?: KeybindGroup[];
  query?: string;
  /** Show the dispatcher each bind runs. */
  showDispatch?: boolean;
  width?: number;
  className?: string;
}

/** SUPER + / overlay: every keybind, grouped and searchable. */
export function KeybindCheatsheet({ groups = defaultKeybinds, query: initial = "", showDispatch = true, width = 1040, className }: KeybindCheatsheetProps) {
  const [query, setQuery] = useState(initial);
  const q = query.toLowerCase();
  const shown = groups
    .map((g) => ({ ...g, binds: g.binds.filter((b) => !q || `${b.action} ${b.keys.join(" ")} ${b.dispatch ?? ""}`.toLowerCase().includes(q)) }))
    .filter((g) => g.binds.length);
  return (
    <div className={["rx-keys", className].filter(Boolean).join(" ")} style={{ width }}>
      <header className="rx-keys-head">
        <Icon name="keyboard" size={20} className="hx-mauve" />
        <b>Keybinds</b>
        <label className="rx-clip-search rx-keys-search">
          <Icon name="search" size={14} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="filter…" />
        </label>
        <span className="hx-faint">~/.config/hypr/binds.conf</span>
      </header>
      <div className="rx-keys-cols">
        {shown.map((g) => (
          <section key={g.title}>
            <h3 className="hx-caps">
              <Icon name={g.icon} size={12} /> {g.title}
            </h3>
            {g.binds.map((b) => (
              <div key={b.action} className="rx-keys-row">
                <span>
                  {b.action}
                  {showDispatch && b.dispatch && <small className="hx-faint">{b.dispatch}</small>}
                </span>
                <Shortcut keys={b.keys} />
              </div>
            ))}
          </section>
        ))}
        {shown.length === 0 && <p className="hx-faint">no bind matches “{query}”</p>}
      </div>
    </div>
  );
}
