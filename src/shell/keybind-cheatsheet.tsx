import { useState } from "react";
import { Icon, Shortcut, cx, type IconName } from "../ui";

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
    <div
      data-component="KeybindCheatsheet"
      className={cx("kit-type max-w-full bg-mantle/96 text-text shadow-popup ring ring-surface0", className)}
      style={{ width }}
    >
      <header className="flex items-center gap-3 border-b border-surface0 px-4 py-3 text-[14px]">
        <Icon name="keyboard" size={20} className="text-mauve" />
        <b>Keybinds</b>
        <label className="flex h-[30px] flex-1 items-center gap-2.5 px-2.5 text-mauve inset-ring inset-ring-surface1">
          <Icon name="search" size={14} />
          <input
            className="uninput h-full flex-1 text-[12px] text-text placeholder:text-overlay0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="filter…"
          />
        </label>
        <span className="text-[11px] text-overlay1">~/.config/hypr/hyprland.lua</span>
      </header>
      <div className="columns-[3_300px] gap-x-7 px-[18px] pt-1.5 pb-[18px]">
        {shown.map((g) => (
          <KeybindSection key={g.title} group={g} showDispatch={showDispatch} />
        ))}
        {shown.length === 0 && <p className="text-overlay1">no bind matches “{query}”</p>}
      </div>
    </div>
  );
}

function KeybindSection({ group: g, showDispatch }: { group: KeybindGroup; showDispatch: boolean }) {
  return (
    <section data-component="KeybindSection" className="break-inside-avoid pt-3">
      <h3 className="caps m-0 mb-1.5 text-mauve">
        <Icon name={g.icon} size={12} /> {g.title}
      </h3>
      {g.binds.map((b) => (
        <div key={b.action} className="flex min-h-[30px] items-center justify-between gap-3 border-b border-surface0/60 py-[3px] text-[12px]">
          <span className="flex min-w-0 flex-col">
            {b.action}
            {showDispatch && b.dispatch && <small className="truncate text-[10px] text-overlay1">{b.dispatch}</small>}
          </span>
          <Shortcut keys={b.keys} />
        </div>
      ))}
    </section>
  );
}
