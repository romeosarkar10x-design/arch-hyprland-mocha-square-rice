import { useMemo, useState } from "react";
import "./shell.css";

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
  className?: string;
}

/** dmenu / tofi / fuzzel-style launcher strip: prompt, input and fuzzy matches. */
export function Dmenu({ items = demoCommands, prompt = "run", query: initial = "", lines, onSelect, width = 1280, className }: DmenuProps) {
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
    <div className={["rx-dmenu", vertical && "is-vertical", className].filter(Boolean).join(" ")} style={{ width }}>
      <div className="rx-dmenu-line">
        <span className="rx-dmenu-prompt">{prompt}</span>
        <input
          className="rx-dmenu-in"
          value={query}
          aria-label={prompt}
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
        {!vertical && (
          <ul className="rx-dmenu-items">
            {matches.map((m, i) => (
              <li key={m} className={i === sel ? "is-active" : undefined} onClick={() => pick(i)}>
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>
      {vertical && (
        <ul className="rx-dmenu-items">
          {matches.slice(0, lines).map((m, i) => (
            <li key={m} className={i === sel ? "is-active" : undefined} onClick={() => pick(i)}>
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
