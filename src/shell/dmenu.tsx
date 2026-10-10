import { useMemo, useState } from "react";
import { cx } from "../ui";

export const demoCommands = [
  "ghostty", "google-chrome-stable", "firefox", "code", "nvim", "yazi", "btop", "pavucontrol", "spotify-launcher",
  "steam", "obsidian", "vesktop", "hyprpicker", "hyprshot", "nwg-look", "blueman-manager", "nm-connection-editor", "wlogout",
];

export interface DmenuProps {
  items?: string[];
  prompt?: string;
  query?: string;
  /** dmenu `-l N`: vertical list of N lines. Omit for the classic single-line strip. */
  lines?: number;
  onSelect?: (item: string) => void;
  width?: number | string;
  autoFocus?: boolean;
  className?: string;
}

/** dmenu / tofi / fuzzel-style launcher strip: prompt, input and fuzzy matches. */
export function Dmenu({ items = demoCommands, prompt = "run", query: initial = "", lines, onSelect, width = 1280, autoFocus, className }: DmenuProps) {
  const [query, setQuery] = useState(initial);
  const [sel, setSel] = useState(0);
  const matches = useMemo(() => {
    const q = query.toLowerCase();
    // Prefix matches first, then substring, like dmenu.
    return [...items.filter((i) => i.startsWith(q)), ...items.filter((i) => !i.startsWith(q) && i.includes(q))];
  }, [items, query]);
  const vertical = lines !== undefined;
  const pick = (i: number) => {
    const item = matches[i];
    if (item) onSelect?.(item);
  };
  return (
    <div
      data-component="Dmenu"
      className={cx("kit-type max-w-full bg-crust text-[13px] text-text shadow-[0_1px_0_var(--hx-surface0)]", className)}
      style={{ width }}
    >
      <div className="flex h-(--hx-bar-height) items-stretch">
        <span className="flex items-center bg-mauve px-3.5 font-bold text-crust">{prompt}</span>
        <input
          className={cx("uninput px-3 caret-mauve", vertical ? "w-auto flex-1" : "w-[244px]")}
          value={query}
          aria-label={prompt}
          autoFocus={autoFocus}
          spellCheck={false}
          onChange={(e) => {
            setQuery(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            const next = vertical ? "ArrowDown" : "ArrowRight", prev = vertical ? "ArrowUp" : "ArrowLeft";
            if (e.key === next || (e.key === "Tab" && !e.shiftKey)) setSel((s) => Math.min(s + 1, matches.length - 1));
            else if (e.key === prev || (e.key === "Tab" && e.shiftKey)) setSel((s) => Math.max(s - 1, 0));
            else if (e.key === "Enter") pick(sel);
            else return;
            e.preventDefault();
          }}
        />
        {!vertical && <DmenuItems items={matches} selected={sel} onPick={pick} />}
      </div>
      {vertical && <DmenuItems items={matches.slice(0, lines)} selected={sel} onPick={pick} vertical />}
    </div>
  );
}

function DmenuItems({ items, selected, onPick, vertical }: { items: string[]; selected: number; onPick: (i: number) => void; vertical?: boolean }) {
  return (
    <ul data-component="DmenuItems" className={cx("m-0 flex list-none overflow-hidden p-0", vertical && "flex-col border-t border-surface0")}>
      {items.map((m, i) => (
        <li
          key={m}
          className={cx(
            "flex cursor-pointer items-center px-3 whitespace-nowrap text-subtext0 hover:text-text",
            vertical && "h-7",
            i === selected &&
              cx("bg-surface0 text-mauve hover:text-mauve", vertical ? "shadow-[inset_2px_0_0_var(--hx-mauve)]" : "shadow-[inset_0_-2px_0_var(--hx-mauve)]"),
          )}
          onClick={() => onPick(i)}
        >
          {m}
        </li>
      ))}
    </ul>
  );
}
