import { useMemo, useState } from "react";
import { Icon, Kbd, cx, type IconName } from "../ui";

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
    <div
      data-component="ClipboardManager"
      className={cx("kit-type max-w-full border-t-2 border-mauve bg-mantle text-text shadow-popup ring ring-surface0", className)}
      style={{ width }}
    >
      <label className="flex h-[47px] items-center gap-2.5 border-b border-surface0 px-4 text-mauve">
        <Icon name="search" size={16} />
        <input
          className="uninput h-full flex-1 text-[14px] text-text placeholder:text-overlay0"
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
        <span className="text-overlay1">{shown.length}</span>
      </label>
      <ul className="m-0 max-h-[360px] list-none overflow-auto p-1.5" role="listbox">
        {shown.map((e, i) => (
          <ClipRow key={e.id} entry={e} active={e === current} onHover={() => setSel(i)} onPick={() => onPaste?.(e)} />
        ))}
        {shown.length === 0 && <li className={cx(row, "cursor-default justify-center text-overlay1")}>nothing matches “{query}”</li>}
      </ul>
      <footer className="flex items-center gap-3.5 border-t border-surface0 bg-crust px-3.5 py-2 text-[11px] text-subtext0 *:inline-flex *:items-center *:gap-1">
        <span><Kbd>⏎</Kbd> paste</span>
        <span><Kbd>DEL</Kbd> delete</span>
        <span><Kbd>CTRL</Kbd><Kbd>P</Kbd> pin</span>
        <span className="flex-1" />
        <span className="text-overlay1">cliphist · {items.length} entries</span>
      </footer>
    </div>
  );
}

const row = "flex h-9 cursor-pointer items-center gap-3 px-2.5 text-[12.5px] text-subtext0";

const valueStyle: Partial<Record<ClipEntry["kind"], string>> = {
  code: "before:text-green before:content-['$_']",
  url: "text-blue underline decoration-surface2",
  image: "italic",
};

function ClipRow({ entry: e, active, onHover, onPick }: { entry: ClipEntry; active: boolean; onHover: () => void; onPick: () => void }) {
  return (
    <li
      data-component="ClipRow"
      role="option"
      aria-selected={active}
      className={cx(row, active && "bg-mauve/12 text-text shadow-[inset_2px_0_0_var(--hx-mauve)]")}
      onMouseEnter={onHover}
      onClick={onPick}
    >
      {e.kind === "colour" ? (
        <i className="size-4 flex-none ring ring-surface1" style={{ background: e.value }} />
      ) : (
        <Icon name={ICONS[e.kind]} size={16} className={active ? "text-mauve" : undefined} />
      )}
      <span className={cx("flex-1 truncate", valueStyle[e.kind])}>{e.value}</span>
      {e.pinned && <Icon name="check" size={12} className="text-mauve" label="pinned" />}
      <span className="text-overlay1">{e.age}</span>
    </li>
  );
}
