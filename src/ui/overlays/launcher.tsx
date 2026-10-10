import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../foundations/icon";
import { IconTile } from "../foundations/icon-tile";
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
    <div className={cx("hx-launch", className)} style={{ width }}>
      <i className="hx-corner tl" />
      <i className="hx-corner tr" />
      <i className="hx-corner bl" />
      <i className="hx-corner br" />
      <div className="hx-launch-in">
        <Icon name="search" />
        <input
          ref={input}
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
        <span className="hx-launch-count">{results.length}</span>
      </div>
      <div className="hx-launch-list" role="listbox">
        {results.length === 0 && (
          <div className="hx-launch-empty">
            <span>
              {"no match for "}
              <b>"{q}"</b>
            </span>
            <span className="hx-faint">
              {"press "}
              <Kbd>↵</Kbd>
              {" to run it as a command"}
            </span>
          </div>
        )}
        {results.map(({ it, hits }, i) => (
          <div
            key={it.id}
            role="option"
            aria-selected={i === sel}
            className={cx("hx-launch-row", i === sel && "is-selected")}
            onMouseEnter={() => setSel(i)}
            onClick={() => onLaunch?.(it)}
          >
            <IconTile icon={it.icon} accent={it.accent} size={30} />
            <span className="hx-launch-name">{highlight(it.name, hits)}</span>
            <span className="hx-launch-detail">{it.detail}</span>
            <Kbd>↵</Kbd>
          </div>
        ))}
      </div>
      <div className="hx-launch-foot">
        <span>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          {" move"}
        </span>
        <span>
          <Kbd>↵</Kbd>
          {" open"}
        </span>
        <span>
          <Kbd>esc</Kbd>
          {" close"}
        </span>
        <span className="hx-spacer" />
        <span>
          <Kbd>SUPER</Kbd>
          <Kbd>R</Kbd>
        </span>
      </div>
    </div>
  );
}

function highlight(text: string, hits: number[]) {
  if (!hits.length) return text;
  const set = new Set(hits);
  return Array.from(text).map((ch, i) => (set.has(i) ? <mark key={i}>{ch}</mark> : <Fragment key={i}>{ch}</Fragment>));
}
