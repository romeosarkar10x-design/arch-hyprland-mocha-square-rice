import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../foundations/icon";
import { IconTile } from "../foundations/icon-tile";
import { Corners } from "../popups/panel";
import { Kbd } from "../foundations/kbd";
import type { IconName } from "../icons";
import { cx, type Accent } from "../lib";

export interface LauncherItem {
  id: string;
  name: string;
  /** Category or command, right-aligned. */
  detail?: string;
  icon: IconName;
  accent?: Accent;
  /** Extra words the fuzzy search falls back to. */
  keywords?: string;
}

export const defaultApps: LauncherItem[] = [
  { id: "ghostty", name: "Ghostty", detail: "Terminal", icon: "ghostty", accent: "mauve", keywords: "terminal shell" },
  { id: "chrome", name: "Google Chrome", detail: "Internet", icon: "chrome", accent: "blue", keywords: "browser web" },
  { id: "firefox", name: "Firefox", detail: "Internet", icon: "firefox", accent: "peach", keywords: "browser web" },
  { id: "code", name: "Visual Studio Code", detail: "Development", icon: "vscode", accent: "sapphire", keywords: "editor ide" },
  { id: "nvim", name: "Neovim", detail: "Development", icon: "code", accent: "green", keywords: "editor vim" },
  { id: "dolphin", name: "Dolphin", detail: "Files", icon: "folder", accent: "yellow", keywords: "files explorer" },
  { id: "spotify", name: "Spotify", detail: "Multimedia", icon: "spotify", accent: "green", keywords: "music" },
  { id: "discord", name: "Discord", detail: "Chat", icon: "chat", accent: "lavender", keywords: "vesktop voice" },
  { id: "steam", name: "Steam", detail: "Games", icon: "steam", accent: "sky", keywords: "games" },
  { id: "btop", name: "btop", detail: "System monitor", icon: "chart", accent: "sky", keywords: "top processes" },
  { id: "pavu", name: "Volume control", detail: "pavucontrol", icon: "volumeHigh", accent: "yellow", keywords: "audio sound" },
  { id: "obsidian", name: "Obsidian", detail: "Notes", icon: "note", accent: "mauve", keywords: "markdown" },
  { id: "calc", name: "Calculator", detail: "qalculate", icon: "calculator", accent: "teal", keywords: "math" },
  { id: "picker", name: "Colour picker", detail: "hyprpicker", icon: "palette", accent: "pink", keywords: "color" },
  { id: "shot", name: "Screenshot region", detail: "grim + slurp", icon: "screenshot", accent: "red", keywords: "capture" },
];

/** Subsequence match; consecutive and word-start hits score higher. Null when not every character matches. */
export function fuzzy(query: string, text: string): { score: number; hits: number[] } | null {
  if (!query) return { score: 0, hits: [] };
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const hits: number[] = [];
  let score = 0;
  let last = -2;
  for (let i = 0, j = 0; i < t.length && j < q.length; i++) {
    if (t[i] === q[j]) {
      hits.push(i);
      score += i === last + 1 ? 3 : 1;
      if (i === 0 || t[i - 1] === " ") score += 4;
      last = i;
      j++;
    }
  }
  return hits.length === q.length ? { score: score - t.length * 0.05, hits } : null;
}

export interface LauncherProps {
  items?: LauncherItem[];
  /** Initial query. */
  query?: string;
  placeholder?: string;
  /** Fires with the chosen item on Enter or click. */
  onLaunch?: (item: LauncherItem) => void;
  onClose?: () => void;
  /** Focus the input on mount. */
  autoFocus?: boolean;
  width?: number;
  className?: string;
}

/** App launcher (wofi replacement): fuzzy search with underlined hits, arrow/enter navigation, keycap footer. */
export function Launcher({
  items = defaultApps,
  query = "",
  placeholder = "Search apps, commands…",
  onLaunch,
  onClose,
  autoFocus = true,
  width = 560,
  className,
}: LauncherProps) {
  const [q, setQ] = useState(query);
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) input.current?.focus({ preventScroll: true });
  }, [autoFocus]);
  const results = useMemo(
    () =>
      items
        .map((it) => {
          const m = fuzzy(q, it.name);
          const k = !m && it.keywords && q ? fuzzy(q, it.keywords) : null;
          return m ? { it, hits: m.hits, score: m.score } : k ? { it, hits: [], score: k.score - 5 } : null;
        })
        .filter((x) => !!x)
        .sort((a, b) => b.score - a.score),
    [q, items],
  );
  useEffect(() => setSel(0), [q]);
  return (
    <div
      data-component="Launcher"
      className={cx("kit-type focus-ring relative bg-mantle text-text shadow-popup ring ring-surface0 [--hx-acc:var(--hx-mauve)]", className)}
      style={{ width }}
    >
      <Corners />
      <div data-component="LauncherSearch" className="flex h-14 items-center gap-3 border-b border-surface0 px-4 text-[16px]">
        <Icon name="search" className="text-[20px] text-mauve" />
        <input
          ref={input}
          className="flex-1 appearance-none border-0 bg-transparent p-0 font-hx text-[16px] text-text caret-mauve placeholder:text-overlay0"
          value={q}
          placeholder={placeholder}
          spellCheck={false}
          aria-label="Search"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(results.length - 1, s + 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(0, s - 1));
            }
            if (e.key === "Enter" && results[sel]) onLaunch?.(results[sel].it);
            if (e.key === "Escape") onClose?.();
          }}
        />
        <span className="bg-surface0 px-1.5 py-0.5 text-[11px] text-overlay1">{results.length}</span>
      </div>
      <div className="max-h-[340px] overflow-auto p-1.5" role="listbox">
        {results.length === 0 && <LauncherEmpty query={q} />}
        {results.map(({ it, hits }, i) => (
          <LauncherRow key={it.id} item={it} hits={hits} selected={i === sel} onHover={() => setSel(i)} onLaunch={() => onLaunch?.(it)} />
        ))}
      </div>
      <LauncherFooter />
    </div>
  );
}

interface LauncherRowProps {
  item: LauncherItem;
  hits: number[];
  selected: boolean;
  onHover: () => void;
  onLaunch: () => void;
}

function LauncherRow({ item, hits, selected, onHover, onLaunch }: LauncherRowProps) {
  return (
    <div
      data-component="LauncherRow"
      role="option"
      aria-selected={selected}
      className={cx(
        "relative flex cursor-pointer items-center gap-3 px-2.5 py-1.5",
        selected && "bg-surface0 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-mauve",
      )}
      onMouseEnter={onHover}
      onClick={onLaunch}
    >
      <IconTile icon={item.icon} accent={item.accent} size={30} />
      <span className="flex-1 text-[13.5px]">{highlight(item.name, hits)}</span>
      <span className="text-[11px] text-overlay1">{item.detail}</span>
      <Kbd className={selected ? undefined : "invisible"}>↵</Kbd>
    </div>
  );
}

function LauncherEmpty({ query }: { query: string }) {
  return (
    <div data-component="LauncherEmpty" className="flex flex-col items-center gap-2.5 p-[30px] text-[13px]">
      <span>
        {"no match for "}
        <b>"{query}"</b>
      </span>
      <span className="text-overlay1">
        {"press "}
        <Kbd>↵</Kbd>
        {" to run it as a command"}
      </span>
    </div>
  );
}

function LauncherFooter() {
  const hint = "inline-flex items-center gap-1";
  return (
    <div data-component="LauncherFooter" className="flex items-center gap-4 border-t border-surface0 bg-crust px-4 py-2 text-[11px] text-overlay1">
      <span className={hint}>
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
        {" move"}
      </span>
      <span className={hint}>
        <Kbd>↵</Kbd>
        {" open"}
      </span>
      <span className={hint}>
        <Kbd>esc</Kbd>
        {" close"}
      </span>
      <span className="flex-1" />
      <span className={hint}>
        <Kbd>SUPER</Kbd>
        <Kbd>R</Kbd>
      </span>
    </div>
  );
}

function highlight(text: string, hits: number[]) {
  if (!hits.length) return text;
  const set = new Set(hits);
  return Array.from(text).map((ch, i) =>
    set.has(i) ? (
      <mark key={i} className="bg-transparent font-bold text-mauve underline decoration-1 underline-offset-[3px]">
        {ch}
      </mark>
    ) : (
      <Fragment key={i}>{ch}</Fragment>
    ),
  );
}
