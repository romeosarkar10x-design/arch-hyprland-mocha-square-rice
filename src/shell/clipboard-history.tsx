import { useState, type KeyboardEvent } from "react";
import { Icon, cx } from "../ui";
import { wallpaper } from "../wallpapers/wallpapers";

export interface ClipItem {
  id: number;
  kind: "text" | "code" | "url" | "colour" | "path" | "image";
  value: string;
  /** Image entries: a URL to preview. */
  src?: string;
  /** "now", "3m", "1h"… */
  age: string;
  pinned?: boolean;
}

export const demoClipItems = (): ClipItem[] => [
  { id: 1, kind: "text", value: "Square corners everywhere, hairlines not shadows. Mauve is the one accent that means “focused”.", age: "now" },
  { id: 2, kind: "image", value: "Screenshot 2560×1440", src: wallpaper("nebula").url, age: "2m" },
  { id: 3, kind: "colour", value: "#cba6f7", age: "5m" },
  { id: 4, kind: "code", value: "hyprctl keyword general:gaps_out 6", age: "12m", pinned: true },
  { id: 5, kind: "url", value: "https://wiki.hypr.land/Configuring/Animations/", age: "30m" },
  { id: 6, kind: "path", value: "~/.config/hypr/hyprland.lua", age: "1h", pinned: true },
  { id: 7, kind: "code", value: "sudo pacman -Syu --needed hyprland waybar wofi", age: "3h" },
];

/** Guess what a copied string is, for previews. */
export function clipKind(value: string): ClipItem["kind"] {
  const v = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return "colour";
  if (/^https?:\/\/\S+$/.test(v)) return "url";
  if (/^(~|\/)[\w./-]+$/.test(v)) return "path";
  if (/^(\$ |sudo |hyprctl |pacman |git |cd |ls )|[{};]\s*$|=>|\bfunction\b/m.test(v)) return "code";
  return "text";
}

const EMOJI = "😀 😂 🥲 😍 🤔 😴 😎 🥳 😭 😡 👍 👎 👏 🙏 💪 👀 🔥 ✨ 🎉 💜 💙 💚 💛 🧡 ❤️ ⭐ ⚡ 🌙 ☀️ 🌈 🍕 ☕ 🐧 🐱 🦊 🚀 💻 ⌨️ 🖱️ 🎧 🎮 📦 🔒 🔑 ✅ ❌ ⚠️ 💡 📌".split(" ");
const KAOMOJI = ["¯\\_(ツ)_/¯", "(╯°□°)╯︵ ┻━┻", "┬─┬ノ( º _ ºノ)", "( ͡° ͜ʖ ͡°)", "(づ｡◕‿‿◕｡)づ", "ʕ•ᴥ•ʔ", "(•_•) ( •_•)>⌐■-■ (⌐■_■)", "(｡•̀ᴗ-)✧", "(ᵔᴥᵔ)", "ಠ_ಠ", "(ノ◕ヮ◕)ノ*:･ﾟ✧", "(￣▽￣)ノ"];
const SYMBOLS = "→ ← ↑ ↓ ↔ ⇒ ⇐ ✓ ✗ • · … – — ° ± × ÷ ≈ ≠ ≤ ≥ ∞ √ ∑ π λ µ Δ Ω © ® ™ € £ ¥ § ¶ ⌘ ⌥ ⇧ ⏎ ⌫ ⎋ ⇥ │ ─ ┌ ┐ └ ┘".split(" ");

function Pin({ size = 14 }: { size?: number }) {
  return (
    <svg data-component="Pin" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2Z" />
    </svg>
  );
}

type Tab = "clipboard" | "emoji" | "kaomoji" | "symbols";

export interface ClipboardHistoryProps {
  items?: ClipItem[];
  tab?: Tab;
  /** Pick an entry. `plain` is set by "paste as text". */
  onPaste?: (value: string, item: ClipItem | null, plain: boolean) => void;
  onClose?: () => void;
  /** Called with the new list after pin / delete / clear. */
  onChange?: (items: ClipItem[]) => void;
  autoFocus?: boolean;
  width?: number;
  className?: string;
}

/**
 * Clipboard history panel in the style of Windows' Win + V: a stack of cards (text,
 * images, colours, links), pin to keep, delete, clear all, plus emoji / kaomoji /
 * symbol pickers. ↑ ↓ move, Enter pastes, Shift + Enter pastes as plain text, P pins, Delete removes.
 */
export function ClipboardHistory({ items: initial = demoClipItems(), tab: initialTab = "clipboard", onPaste, onClose, onChange, autoFocus, width = 380, className }: ClipboardHistoryProps) {
  const [items, setItemsState] = useState(initial);
  const [prev, setPrev] = useState(initial);
  if (prev !== initial) {
    setPrev(initial);
    setItemsState(initial);
  }
  const [tab, setTab] = useState<Tab>(initialTab);
  const [sel, setSel] = useState(0);
  const [menu, setMenu] = useState<number | null>(null);
  const ordered = [...items.filter((i) => i.pinned), ...items.filter((i) => !i.pinned)];
  const current = ordered[Math.min(sel, ordered.length - 1)];

  const setItems = (next: ClipItem[]) => {
    setItemsState(next);
    onChange?.(next);
  };
  const pin = (id: number) => setItems(items.map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i)));
  const del = (id: number) => setItems(items.filter((i) => i.id !== id));
  const paste = (i: ClipItem, plain = false) => onPaste?.(i.value, i, plain);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose?.();
    else if (tab !== "clipboard") return;
    else if (e.key === "ArrowDown") setSel((s) => Math.min(s + 1, ordered.length - 1));
    else if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
    else if (e.key === "Enter" && current) paste(current, e.shiftKey);
    else if (e.key === "Delete" && current) del(current.id);
    else if (e.key.toLowerCase() === "p" && current) pin(current.id);
    else return;
    e.preventDefault();
  };

  const tabs: [Tab, string, string][] = [["clipboard", "clipboard", "Clipboard history"], ["emoji", "😀", "Emoji"], ["kaomoji", ";-)", "Kaomoji"], ["symbols", "Ω", "Symbols"]];
  return (
    <div
      data-component="ClipboardHistory"
      className={cx(
        "flex max-h-[560px] max-w-full flex-col border-t-2 border-mauve bg-mantle/92 font-hx text-text shadow-popup ring ring-surface0 outline-none backdrop-blur-[16px]",
        className,
      )}
      style={{ width }}
      tabIndex={0}
      onKeyDown={onKeyDown}
      ref={autoFocus ? (el) => el?.focus() : undefined}
      role="dialog"
      aria-label="Clipboard history"
    >
      <nav className="flex items-center gap-0.5 border-b border-surface0 p-1.5" role="tablist">
        {tabs.map(([t, glyph, label]) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === tab}
            title={label}
            className={cx(tabButton, t === tab && "text-mauve shadow-[inset_0_-2px_0_var(--hx-mauve)]")}
            onClick={() => setTab(t)}
          >
            {t === "clipboard" ? <Icon name="note" size={16} /> : glyph}
          </button>
        ))}
        <span className="flex-1" />
        {onClose && (
          <button type="button" title="Close (Esc)" className={tabButton} onClick={onClose}>
            <Icon name="close" size={14} />
          </button>
        )}
      </nav>

      {tab === "clipboard" && (
        <>
          <header className="flex items-center px-3 pt-2.5 pb-1.5 text-[13px]">
            <b>Clipboard</b>
            <span className="flex-1" />
            <button
              type="button"
              className="unbutton cursor-pointer px-1.5 py-0.5 text-[12px] text-mauve disabled:cursor-default disabled:text-overlay0"
              disabled={!items.some((i) => !i.pinned)}
              onClick={() => setItems(items.filter((i) => i.pinned))}
            >
              Clear all
            </button>
          </header>
          <ul className="m-0 grid list-none gap-1.5 overflow-auto px-2.5 pt-1 pb-2.5" role="listbox">
            {ordered.map((i, n) => (
              <ClipCard
                key={i.id}
                item={i}
                active={i === current}
                menuOpen={menu === i.id}
                onHover={() => setSel(n)}
                onPaste={(plain) => paste(i, plain)}
                onMenu={(open) => setMenu(open ? i.id : null)}
                onPin={() => pin(i.id)}
                onDelete={() => del(i.id)}
              />
            ))}
            {ordered.length === 0 && (
              <li className="flex flex-col items-center gap-1.5 py-[30px] text-center text-[12.5px] text-overlay1">
                <Icon name="note" size={28} />
                <b>Nothing here yet</b>
                <span className="text-overlay1">Copy something and it shows up here.</span>
              </li>
            )}
          </ul>
          <footer className="border-t border-surface0 px-3 py-1.5 text-[10.5px] text-overlay1">⏎ paste · ⇧⏎ as text · P pin · DEL delete · ESC close</footer>
        </>
      )}

      {tab !== "clipboard" && <GlyphGrid tab={tab} onPick={(g) => onPaste?.(g, null, true)} />}
    </div>
  );
}

const tabButton = "unbutton grid h-[30px] min-w-9 cursor-pointer place-items-center px-2 text-[14px] text-subtext0 hover:bg-surface0";
const sideButton = "unbutton grid size-6 cursor-pointer place-items-center text-overlay1 hover:bg-surface0 hover:text-text";

const textStyle: Partial<Record<ClipItem["kind"], string>> = {
  code: "text-green before:text-overlay1 before:content-['$_']",
  url: "text-blue underline decoration-surface2",
  path: "text-yellow",
};

interface ClipCardProps {
  item: ClipItem;
  active: boolean;
  menuOpen: boolean;
  onHover: () => void;
  onPaste: (plain: boolean) => void;
  onMenu: (open: boolean) => void;
  onPin: () => void;
  onDelete: () => void;
}

/** One history entry: a text / image / colour preview with pin and "more" buttons. */
function ClipCard({ item: i, active, menuOpen, onHover, onPaste, onMenu, onPin, onDelete }: ClipCardProps) {
  return (
    <li
      data-component="ClipCard"
      role="option"
      aria-selected={active}
      className={cx(
        "relative grid cursor-pointer grid-cols-[1fr_auto] gap-2 bg-base pt-2.5 pr-2.5 pb-[18px] pl-3 text-[12.5px] ring ring-surface0",
        active && "bg-[color-mix(in_srgb,var(--hx-mauve)_7%,var(--hx-base))] shadow-[inset_3px_0_0_var(--hx-mauve)] ring-mauve",
      )}
      onMouseEnter={onHover}
      onClick={() => onPaste(false)}
    >
      <div className="min-w-0">
        {i.kind === "image" ? (
          <img src={i.src} alt={i.value} className="block max-h-[110px] w-full object-cover ring ring-surface1" />
        ) : i.kind === "colour" ? (
          <span className="flex items-center gap-2.5">
            <i className="h-[22px] w-[34px] ring ring-surface1" style={{ background: i.value }} />
            {i.value}
          </span>
        ) : (
          <span className={cx("line-clamp-3 leading-[1.45] whitespace-pre-wrap [word-break:break-word]", textStyle[i.kind])}>{i.value}</span>
        )}
      </div>
      <div className="relative flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
        <button type="button" title="More" className={cx(sideButton, !active && "invisible")} onClick={() => onMenu(!menuOpen)}>
          <Icon name="more" size={14} />
        </button>
        <button
          type="button"
          title={i.pinned ? "Unpin" : "Pin"}
          className={cx(sideButton, i.pinned ? "text-mauve hover:text-mauve" : !active && "invisible")}
          onClick={onPin}
        >
          <Pin />
        </button>
        {menuOpen && (
          <div className="absolute top-0 right-[26px] z-2 flex min-w-[140px] flex-col bg-crust p-1 shadow-popup ring ring-surface1" role="menu">
            {(
              [
                ["Paste as text", () => onPaste(true)],
                [i.pinned ? "Unpin" : "Pin", onPin],
                ["Delete", onDelete],
              ] as const
            ).map(([label, act]) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                className="unbutton block cursor-pointer px-2.5 py-1.5 text-left text-[12px] text-text hover:bg-surface0"
                onClick={() => (onMenu(false), act())}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <small className="absolute bottom-1 left-3 text-[10px] text-overlay0">{i.age}</small>
    </li>
  );
}

const glyphs = { emoji: EMOJI, kaomoji: KAOMOJI, symbols: SYMBOLS };

/** Emoji / kaomoji / symbol picker grid. */
function GlyphGrid({ tab, onPick }: { tab: Exclude<Tab, "clipboard">; onPick: (glyph: string) => void }) {
  return (
    <div
      data-component="GlyphGrid"
      className={cx("grid gap-0.5 overflow-auto p-2.5", tab === "kaomoji" ? "grid-cols-2" : "grid-cols-[repeat(auto-fill,minmax(38px,1fr))]")}
    >
      {glyphs[tab].map((g) => (
        <button
          key={g}
          type="button"
          className={cx(
            "unbutton h-[38px] cursor-pointer hover:bg-surface0",
            tab === "kaomoji" ? "px-2 text-left text-[13px]" : tab === "symbols" ? "text-[17px]" : "text-[20px]",
          )}
          onClick={() => onPick(g)}
          title={g}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
