import type { CSSProperties } from "react";
import { Icon, Wallpaper, WindowFrame } from "../ui";
import type { CursorShape, Emulator, TerminalOptions } from "../theme/exports";
import { renderProgram, type Program } from "./programs";
import "./terminal.css";

export interface TerminalEmulatorProps {
  /** Which emulator's chrome and tab bar to draw. */
  emulator?: Emulator;
  /** What is running inside. */
  program?: Program;
  /** Font size in px. */
  fontSize?: number;
  /** Inner padding in px. */
  padding?: number;
  /** Background opacity, 0..1. Below 1 the wallpaper shows through, blurred like Hyprland does. */
  opacity?: number;
  cursor?: CursorShape;
  cursorBlink?: boolean;
  /** Tab titles. Ghostty, kitty and WezTerm draw a tab bar when there is more than one. */
  tabs?: string[];
  /** Index of the active tab. */
  activeTab?: number;
  /** Kitty's `tab_bar_style`. */
  tabStyle?: TerminalOptions["tabStyle"];
  /** Client-side decorations (Ghostty's GTK header bar, foot's CSD). Off under Hyprland by default. */
  decorations?: boolean;
  /** Draw the Hyprland window border around it. */
  framed?: boolean;
  focused?: boolean;
  /** Show the wallpaper behind the window (visible through `opacity`). */
  backdrop?: boolean;
  title?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const NAMES: Record<Emulator, string> = {
  ghostty: "ghostty 1.2.1",
  kitty: "kitty 0.43.1",
  alacritty: "alacritty 0.16.0",
  foot: "foot 1.24.0",
  wezterm: "WezTerm 20251010",
};

function TabBar({ emulator, tabs, active, style }: { emulator: Emulator; tabs: string[]; active: number; style: string }) {
  if (emulator === "alacritty" || emulator === "foot" || tabs.length < 2 || (emulator === "kitty" && style === "hidden")) return null;
  return (
    <div className={`rx-tabs rx-tabs--${emulator} rx-tabs--${style}`} role="tablist">
      {tabs.map((t, i) => (
        <div key={i} role="tab" aria-selected={i === active} className={i === active ? "is-active" : undefined}>
          {emulator === "wezterm" ? ` ${i + 1}: ${t} ` : emulator === "kitty" ? ` ${i + 1} ${t} ` : t}
          {emulator === "ghostty" && <Icon name="close" size={12} className="rx-tab-x" />}
        </div>
      ))}
      {emulator === "wezterm" && <div className="rx-tab-new">+</div>}
    </div>
  );
}

function Decorations({ emulator, title }: { emulator: Emulator; title: string }) {
  if (emulator === "ghostty") {
    return (
      <header className="rx-csd rx-csd--ghostty">
        <span className="rx-csd-btn">
          <Icon name="plus" size={14} />
        </span>
        <span className="rx-csd-title">{title}</span>
        <span className="rx-csd-btn">
          <Icon name="more" size={14} />
        </span>
        <span className="rx-csd-btn rx-csd-close">
          <Icon name="close" size={14} />
        </span>
      </header>
    );
  }
  if (emulator === "foot") {
    return (
      <header className="rx-csd rx-csd--foot">
        <span className="rx-csd-title">{title}</span>
        <span className="rx-csd-btn">
          <Icon name="minus" size={12} />
        </span>
        <span className="rx-csd-btn">
          <Icon name="monitor" size={12} />
        </span>
        <span className="rx-csd-btn rx-csd-close">
          <Icon name="close" size={12} />
        </span>
      </header>
    );
  }
  return null;
}

/**
 * A terminal window as each emulator draws it, running a preset program. Colours are the
 * 16-colour ANSI palette derived from the active theme (the same mapping the generated
 * kitty / ghostty / … configs use), so it follows wallpaper themes too.
 */
export function TerminalEmulator({
  emulator = "ghostty",
  program = "fastfetch",
  fontSize = 12.5,
  padding = 12,
  opacity = 0.92,
  cursor = "block",
  cursorBlink = true,
  tabs = ["zsh", "nvim", "btop"],
  activeTab = 0,
  tabStyle = "powerline",
  decorations = false,
  framed = true,
  focused = true,
  backdrop = true,
  title = "romeo@archlinux: ~",
  width = 820,
  height = 500,
  className,
}: TerminalEmulatorProps) {
  const style = {
    "--rx-term-alpha": `${Math.round(opacity * 100)}%`,
    "--rx-term-pad": `${padding}px`,
    fontSize,
  } as CSSProperties;
  const term = (
    <div
      className={["rx-temu", `rx-temu--${emulator}`, className].filter(Boolean).join(" ")}
      data-cursor={cursor}
      data-blink={cursorBlink || undefined}
      style={style}
    >
      {decorations && <Decorations emulator={emulator} title={title} />}
      <TabBar emulator={emulator} tabs={tabs} active={activeTab} style={tabStyle} />
      <div className="rx-temu-body">{renderProgram(program, NAMES[emulator])}</div>
    </div>
  );
  const window = framed ? (
    <WindowFrame focused={focused} tag={emulator} style={{ position: "relative", inset: "auto", width: "100%", height: "100%" }}>
      {term}
    </WindowFrame>
  ) : (
    term
  );
  return (
    <div className="rx-temu-stage" style={{ width, height }}>
      {backdrop && <Wallpaper variant="image" />}
      <div className="rx-temu-pos">{window}</div>
    </div>
  );
}
