import type { CSSProperties } from "react";
import { Icon, Wallpaper, WindowFrame, cx } from "../ui";
import type { CursorShape, Emulator, TerminalOptions } from "../theme/exports";
import { renderProgram, type Program } from "./programs";

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

/** The 16-colour ANSI palette, derived from the --hx-* theme (Catppuccin mapping). Programs paint with `fg[n]` / `bg[n]`. */
const ANSI = {
  "--rx-ansi-0": "var(--hx-surface1)",
  "--rx-ansi-1": "var(--hx-red)",
  "--rx-ansi-2": "var(--hx-green)",
  "--rx-ansi-3": "var(--hx-yellow)",
  "--rx-ansi-4": "var(--hx-blue)",
  "--rx-ansi-5": "var(--hx-pink)",
  "--rx-ansi-6": "var(--hx-teal)",
  "--rx-ansi-7": "color-mix(in oklab, var(--hx-subtext0), var(--hx-text))",
  "--rx-ansi-8": "var(--hx-surface2)",
  "--rx-ansi-9": "color-mix(in oklab, var(--hx-red) 82%, white)",
  "--rx-ansi-10": "color-mix(in oklab, var(--hx-green) 82%, white)",
  "--rx-ansi-11": "color-mix(in oklab, var(--hx-yellow) 82%, white)",
  "--rx-ansi-12": "color-mix(in oklab, var(--hx-blue) 82%, white)",
  "--rx-ansi-13": "color-mix(in oklab, var(--hx-pink) 82%, white)",
  "--rx-ansi-14": "color-mix(in oklab, var(--hx-teal) 82%, white)",
  "--rx-ansi-15": "var(--hx-subtext0)",
};

// Tab chrome per emulator, then per kitty tab_bar_style (the style classes apply to every emulator's tabs).
const tabBar: Partial<Record<Emulator, string>> = {
  ghostty: "border-b border-surface0 bg-mantle",
  wezterm: "gap-px",
};
const tabFor: Partial<Record<Emulator, { tab: string; next?: string; active: string }>> = {
  ghostty: {
    tab: "h-8 flex-1 justify-center gap-2",
    next: "shadow-[inset_1px_0_0_var(--hx-surface0)]",
    active: "bg-base text-text shadow-[inset_0_-2px_0_var(--hx-mauve)]",
  },
  kitty: { tab: "h-[22px] bg-mantle", active: "bg-mauve" },
  wezterm: { tab: "h-6 bg-mantle", active: "" },
};
const tabStyleFor: Record<string, { tab: string; next?: string; active?: string }> = {
  powerline: {
    tab: "-mr-2 pr-2.5 [clip-path:polygon(0_0,calc(100%_-_10px)_0,100%_50%,calc(100%_-_10px)_100%,0_100%)]",
    next: "pl-3",
    active: "z-1",
  },
  slant: { tab: "-mr-1 px-3 [clip-path:polygon(8px_0,100%_0,calc(100%_-_8px)_100%,0_100%)]" },
  separator: { tab: "bg-transparent", next: "before:text-surface2 before:content-['│']", active: "bg-transparent text-mauve" },
  fade: { tab: "bg-transparent before:text-surface1 before:content-['░▒▓']", active: "bg-transparent text-mauve" },
  hidden: { tab: "" },
};

function TabBar({ emulator, tabs, active, style }: { emulator: Emulator; tabs: string[]; active: number; style: string }) {
  if (emulator === "alacritty" || emulator === "foot" || tabs.length < 2 || (emulator === "kitty" && style === "hidden")) return null;
  const e = tabFor[emulator];
  const st = tabStyleFor[style] ?? tabStyleFor.hidden!;
  const tab = (i: number, on: boolean) =>
    cx(
      "relative flex items-center text-overlay1",
      e?.tab,
      st.tab,
      i > 0 && cx(e?.next, st.next),
      on && cx("bg-mauve font-bold text-crust", e?.active, st.active),
    );
  return (
    <div data-component="TabBar" className={cx("flex flex-none bg-crust text-[11.5px] whitespace-pre select-none", tabBar[emulator])} role="tablist">
      {tabs.map((t, i) => (
        <div key={i} role="tab" aria-selected={i === active} className={tab(i, i === active)}>
          {emulator === "wezterm" ? ` ${i + 1}: ${t} ` : emulator === "kitty" ? ` ${i + 1} ${t} ` : t}
          {emulator === "ghostty" && <Icon name="close" size={12} className="opacity-50" />}
        </div>
      ))}
      {emulator === "wezterm" && <div className={cx(tab(tabs.length, false), "bg-transparent px-2.5")}>+</div>}
    </div>
  );
}

const csdButton = "grid size-7 place-items-center hover:bg-surface0 hover:text-text";
const csdClose = "hover:bg-red hover:text-crust";

/** Client-side decorations: Ghostty's GTK header bar, foot's thin title strip. */
function Decorations({ emulator, title }: { emulator: Emulator; title: string }) {
  const bar = "flex flex-none items-center gap-1 text-subtext0 select-none";
  const titleCls = "flex-1 overflow-hidden text-ellipsis text-text";
  if (emulator === "ghostty") {
    return (
      <header data-component="Decorations" className={cx(bar, "h-[41px] border-b border-surface0 bg-mantle px-1.5")}>
        <span className={csdButton}>
          <Icon name="plus" size={14} />
        </span>
        <span className={cx(titleCls, "text-center text-[12px] font-bold")}>{title}</span>
        <span className={csdButton}>
          <Icon name="more" size={14} />
        </span>
        <span className={cx(csdButton, csdClose)}>
          <Icon name="close" size={14} />
        </span>
      </header>
    );
  }
  if (emulator === "foot") {
    return (
      <header data-component="Decorations" className={cx(bar, "h-[26px] bg-crust pl-2.5")}>
        <span className={cx(titleCls, "text-left text-[11px] font-normal")}>{title}</span>
        <span className={cx(csdButton, "size-[26px]")}>
          <Icon name="minus" size={12} />
        </span>
        <span className={cx(csdButton, "size-[26px]")}>
          <Icon name="monitor" size={12} />
        </span>
        <span className={cx(csdButton, csdClose, "size-[26px]")}>
          <Icon name="close" size={12} />
        </span>
      </header>
    );
  }
  return null;
}

/** The character grid: a program's output, padded by --rx-term-pad. Needs the ANSI vars from an ancestor or `palette`. */
export function TerminalScreen({
  program,
  name,
  palette,
  className,
  style,
}: {
  program: Program;
  name: string;
  palette?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      data-component="TerminalScreen"
      className={cx(
        // Every line is at least one cell tall; programs wrap their lines in `contents` divs, so reach through those.
        "relative min-h-0 flex-1 overflow-hidden p-[var(--rx-term-pad,12px)] whitespace-pre *:min-h-[1.45em] [&_.contents>*]:min-h-[1.45em]",
        className,
      )}
      style={palette ? ({ ...ANSI, ...style } as CSSProperties) : style}
    >
      {renderProgram(program, name)}
    </div>
  );
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
    ...ANSI,
    "--rx-term-alpha": `${Math.round(opacity * 100)}%`,
    "--rx-term-pad": `${padding}px`,
    fontSize,
  } as CSSProperties;
  const term = (
    <div
      data-component="TerminalWindow"
      data-emulator={emulator}
      className={cx(
        "group/term relative flex size-full flex-col overflow-hidden font-hx leading-[1.45] text-text",
        "bg-[color-mix(in_srgb,var(--hx-base)_var(--rx-term-alpha,92%),transparent)] backdrop-blur-[10px] backdrop-saturate-[1.15]",
        className,
      )}
      data-cursor={cursor}
      data-blink={cursorBlink || undefined}
      style={style}
    >
      {decorations && <Decorations emulator={emulator} title={title} />}
      <TabBar emulator={emulator} tabs={tabs} active={activeTab} style={tabStyle} />
      <TerminalScreen program={program} name={NAMES[emulator]} />
    </div>
  );
  const window = framed ? (
    <WindowFrame focused={focused} tag={emulator} bodyClassName="bg-transparent" style={{ position: "relative", inset: "auto", width: "100%", height: "100%" }}>
      {term}
    </WindowFrame>
  ) : (
    term
  );
  return (
    <div data-component="TerminalEmulator" className="relative max-w-full overflow-hidden bg-crust" style={{ width, height }}>
      {backdrop && <Wallpaper variant="image" />}
      <div className="absolute inset-[22px]">{window}</div>
    </div>
  );
}
