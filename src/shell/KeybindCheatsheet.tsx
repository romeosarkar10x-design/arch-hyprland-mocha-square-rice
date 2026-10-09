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

/** The binds from ~/.config/hypr/hyprland.lua, with the per-direction loops folded into one row. */
export const defaultKeybinds: KeybindGroup[] = [
  {
    title: "Apps",
    icon: "app",
    binds: [
      { keys: ["SUPER", "⏎"], action: "Terminal (ghostty)", dispatch: "exec_cmd(terminal)" },
      { keys: ["SUPER", "SPACE"], action: "App launcher", dispatch: 'exec_cmd("wofi --show drun")' },
      { keys: ["SUPER", "E"], action: "Files (dolphin)", dispatch: "exec_cmd(fileManager)" },
    ],
  },
  {
    title: "Windows",
    icon: "monitor",
    binds: [
      { keys: ["SUPER", "X"], action: "Close", dispatch: "window.close()" },
      { keys: ["SUPER", "V"], action: "Toggle floating", dispatch: 'window.float({ action = "toggle" })' },
      { keys: ["SUPER", "H J K L"], action: "Move focus", dispatch: "focus({ direction })" },
      { keys: ["SUPER", "SHIFT", "H J K L"], action: "Swap window", dispatch: "window.swap({ direction })" },
      { keys: ["SUPER", "ALT", "H J K L"], action: "Resize (hold)", dispatch: "window.resize({ x, y, relative })" },
      { keys: ["SUPER", "O"], action: "Next opens below", dispatch: 'layout("preselect d")' },
      { keys: ["SUPER", "U"], action: "Next opens right", dispatch: 'layout("preselect r")' },
      { keys: ["SUPER", "LMB / RMB"], action: "Drag / resize", dispatch: "window.drag() / window.resize()" },
    ],
  },
  {
    title: "Workspaces",
    icon: "more",
    binds: [
      { keys: ["SUPER", "1…0"], action: "Go to workspace", dispatch: "focus({ workspace = i })" },
      { keys: ["SUPER", "SHIFT", "1…0"], action: "Move to workspace", dispatch: "window.move({ workspace = i })" },
      { keys: ["SUPER", "S"], action: "Scratchpad", dispatch: 'workspace.toggle_special("magic")' },
      { keys: ["SUPER", "SHIFT", "S"], action: "Move to scratchpad", dispatch: 'window.move({ workspace = "special:magic" })' },
      { keys: ["SUPER", "SCROLL"], action: "Cycle workspaces", dispatch: 'focus({ workspace = "e±1" })' },
    ],
  },
  {
    title: "Media & session",
    icon: "music",
    binds: [
      { keys: ["VOL+ / VOL−"], action: "Volume ±5%", dispatch: "wpctl set-volume" },
      { keys: ["MUTE"], action: "Mute output", dispatch: "wpctl set-mute @DEFAULT_AUDIO_SINK@" },
      { keys: ["MIC MUTE"], action: "Mute mic", dispatch: "wpctl set-mute @DEFAULT_AUDIO_SOURCE@" },
      { keys: ["⏯ ⏭ ⏮"], action: "Media", dispatch: "playerctl" },
      { keys: ["SUPER", "M"], action: "Exit Hyprland", dispatch: "exit()" },
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
        <span className="hx-faint">~/.config/hypr/hyprland.lua</span>
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
