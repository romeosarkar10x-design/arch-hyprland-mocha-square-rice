import { useMemo, useState } from "react";
import { Icon, Kbd, type IconName } from "../ds";
import "./shell.css";

export interface ClipEntry {
  id: number;
  kind: "text" | "code" | "url" | "colour" | "image" | "path";
  value: string;
  age: string;
  pinned?: boolean;
}

export const demoClips: ClipEntry[] = [
  { id: 1, kind: "code", value: "hyprctl keyword general:gaps_out 6", age: "now", pinned: true },
  { id: 2, kind: "colour", value: "#cba6f7", age: "1m" },
  { id: 3, kind: "url", value: "https://wiki.hypr.land/Configuring/Variables/", age: "4m" },
  { id: 4, kind: "image", value: "screenshot 2560×1440 · 1.2 MiB", age: "9m" },
  { id: 5, kind: "text", value: "Square corners everywhere, hairlines not shadows.", age: "21m" },
  { id: 6, kind: "path", value: "~/.config/hypr/hyprland.conf", age: "40m", pinned: true },
  { id: 7, kind: "code", value: "sudo pacman -Syu --needed base-devel", age: "1h" },
  { id: 8, kind: "colour", value: "#89b4fa", age: "2h" },
];

const ICONS: Record<ClipEntry["kind"], IconName> = {
  text: "note", code: "terminal", url: "globe", colour: "palette", image: "image", path: "folder",
};

export interface ClipboardManagerProps {
  entries?: ClipEntry[];
  query?: string;
  onPaste?: (entry: ClipEntry) => void;
  width?: number;
  className?: string;
}

/** cliphist picker: searchable history with pins, colour and image previews. */
export function ClipboardManager({ entries = demoClips, query: initialQuery = "", onPaste, width = 560, className }: ClipboardManagerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [sel, setSel] = useState(0);
  const [items, setItems] = useState(entries);
  const shown = useMemo(() => {
    const q = query.toLowerCase();
    const hits = items.filter((e) => e.value.toLowerCase().includes(q) || e.kind.includes(q));
    return [...hits.filter((e) => e.pinned), ...hits.filter((e) => !e.pinned)];
  }, [items, query]);
  const current = shown[Math.min(sel, shown.length - 1)];

  return (
    <div className={["rx-clip", className].filter(Boolean).join(" ")} style={{ width }}>
      <label className="rx-clip-search">
        <Icon name="search" size={16} />
        <input
          value={query}
          placeholder="Search clipboard…"
          onChange={(e) => {
            setQuery(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setSel((s) => Math.min(s + 1, shown.length - 1));
            else if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
            else if (e.key === "Enter" && current) onPaste?.(current);
            else if (e.key === "Delete" && current) setItems((xs) => xs.filter((x) => x.id !== current.id));
            else return;
            e.preventDefault();
          }}
        />
        <span className="hx-faint">{shown.length}</span>
      </label>
      <ul className="rx-clip-list" role="listbox">
        {shown.map((e, i) => (
          <li
            key={e.id}
            role="option"
            aria-selected={e === current}
            className={e === current ? "is-active" : undefined}
            onMouseEnter={() => setSel(i)}
            onClick={() => onPaste?.(e)}
          >
            {e.kind === "colour" ? <i className="rx-clip-colour" style={{ background: e.value }} /> : <Icon name={ICONS[e.kind]} size={16} />}
            <span className={`rx-clip-value rx-clip--${e.kind}`}>{e.value}</span>
            {e.pinned && <Icon name="check" size={12} className="hx-mauve" label="pinned" />}
            <span className="hx-faint">{e.age}</span>
          </li>
        ))}
        {shown.length === 0 && <li className="rx-clip-none hx-faint">nothing matches “{query}”</li>}
      </ul>
      <footer className="rx-clip-foot">
        <span><Kbd>⏎</Kbd> paste</span>
        <span><Kbd>DEL</Kbd> delete</span>
        <span><Kbd>CTRL</Kbd><Kbd>P</Kbd> pin</span>
        <span className="hx-spacer" />
        <span className="hx-faint">cliphist · {items.length} entries</span>
      </footer>
    </div>
  );
}
