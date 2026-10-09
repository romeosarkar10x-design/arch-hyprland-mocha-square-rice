import { useState, type KeyboardEvent } from "react";
import { Icon } from "../ds";
import { wallpaper } from "../wallpapers/wallpapers";
import "./shell.css";

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
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
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
    <div className={["rx-cbh", className].filter(Boolean).join(" ")} style={{ width }} tabIndex={0} onKeyDown={onKeyDown} ref={autoFocus ? (el) => el?.focus() : undefined} role="dialog" aria-label="Clipboard history">
      <nav className="rx-cbh-tabs" role="tablist">
        {tabs.map(([t, glyph, label]) => (
          <button key={t} type="button" role="tab" aria-selected={t === tab} title={label} className={t === tab ? "is-active" : undefined} onClick={() => setTab(t)}>
            {t === "clipboard" ? <Icon name="note" size={16} /> : glyph}
          </button>
        ))}
        <span className="hx-spacer" />
        {onClose && (
          <button type="button" title="Close (Esc)" onClick={onClose}>
            <Icon name="close" size={14} />
          </button>
        )}
      </nav>

      {tab === "clipboard" && (
        <>
          <header className="rx-cbh-head">
            <b>Clipboard</b>
            <span className="hx-spacer" />
            <button type="button" className="rx-cbh-clear" disabled={!items.some((i) => !i.pinned)} onClick={() => setItems(items.filter((i) => i.pinned))}>
              Clear all
            </button>
          </header>
          <ul className="rx-cbh-list" role="listbox">
            {ordered.map((i, n) => (
              <li
                key={i.id}
                role="option"
                aria-selected={i === current}
                className={["rx-cbh-card", `rx-cbh--${i.kind}`, i === current && "is-active"].filter(Boolean).join(" ")}
                onMouseEnter={() => setSel(n)}
                onClick={() => paste(i)}
              >
                <div className="rx-cbh-body">
                  {i.kind === "image" ? (
                    <img src={i.src} alt={i.value} />
                  ) : i.kind === "colour" ? (
                    <span className="rx-cbh-colour">
                      <i style={{ background: i.value }} />
                      {i.value}
                    </span>
                  ) : (
                    <span className="rx-cbh-text">{i.value}</span>
                  )}
                </div>
                <div className="rx-cbh-side" onClick={(e) => e.stopPropagation()}>
                  <button type="button" title="More" className="rx-cbh-more" onClick={() => setMenu(menu === i.id ? null : i.id)}>
                    <Icon name="more" size={14} />
                  </button>
                  <button type="button" title={i.pinned ? "Unpin" : "Pin"} className={["rx-cbh-pin", i.pinned && "is-on"].filter(Boolean).join(" ")} onClick={() => pin(i.id)}>
                    <Pin />
                  </button>
                  {menu === i.id && (
                    <div className="rx-cbh-menu" role="menu">
                      <button type="button" role="menuitem" onClick={() => (setMenu(null), paste(i, true))}>
                        Paste as text
                      </button>
                      <button type="button" role="menuitem" onClick={() => (setMenu(null), pin(i.id))}>
                        {i.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button type="button" role="menuitem" onClick={() => (setMenu(null), del(i.id))}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <small className="rx-cbh-age">{i.age}</small>
              </li>
            ))}
            {ordered.length === 0 && (
              <li className="rx-cbh-empty">
                <Icon name="note" size={28} />
                <b>Nothing here yet</b>
                <span className="hx-faint">Copy something and it shows up here.</span>
              </li>
            )}
          </ul>
          <footer className="rx-cbh-foot hx-faint">⏎ paste · ⇧⏎ as text · P pin · DEL delete · ESC close</footer>
        </>
      )}

      {tab !== "clipboard" && (
        <div className={`rx-cbh-grid rx-cbh-grid--${tab}`}>
          {(tab === "emoji" ? EMOJI : tab === "kaomoji" ? KAOMOJI : SYMBOLS).map((g) => (
            <button key={g} type="button" onClick={() => onPaste?.(g, null, true)} title={g}>
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
