import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Icon, Kbd } from "../ui";
import { clipKind, ClipboardHistory, demoClipItems, type ClipItem } from "./clipboard-history";

const SOURCE = `Copy anything from here (select + Ctrl+C):

#89b4fa
https://wiki.hypr.land/Configuring/Binds/
~/.config/hypr/hyprland.lua
hyprctl dispatch workspace 3
Square corners everywhere.`;

/**
 * A working clipboard manager: copies made on this page (Ctrl+C) land in the history,
 * and Ctrl+Shift+V in the editor opens the panel to paste any of them at the cursor.
 */
export function ClipboardDemo() {
  const [items, setItems] = useState<ClipItem[]>(demoClipItems);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("Paste here with Ctrl+Shift+V → ");
  const editor = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<[number, number]>([text.length, text.length]);
  const nextId = useRef(100);

  const onCopy = (e: ClipboardEvent<HTMLElement>) => {
    const t = e.target as HTMLTextAreaElement | HTMLElement;
    const value = "selectionStart" in t && t.selectionStart !== null ? t.value.slice(t.selectionStart, t.selectionEnd ?? t.selectionStart) : (window.getSelection()?.toString() ?? "");
    if (!value.trim()) return;
    setItems((xs) => [{ id: nextId.current++, kind: clipKind(value), value, age: "now" }, ...xs.filter((x) => x.value !== value || x.pinned)]);
  };

  const openPanel = () => {
    const el = editor.current;
    if (el) caret.current = [el.selectionStart, el.selectionEnd];
    setOpen(true);
  };

  const paste = (value: string) => {
    const [a, b] = caret.current;
    const next = text.slice(0, a) + value + text.slice(b);
    setText(next);
    setOpen(false);
    // Put it on the real clipboard too, best effort.
    navigator.clipboard?.writeText(value).catch(() => undefined);
    requestAnimationFrame(() => {
      const el = editor.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(a + value.length, a + value.length);
    });
  };

  const onEditorKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "v") {
      e.preventDefault();
      openPanel();
    }
  };

  const textarea = "w-full resize-y border-0 bg-mantle p-3 font-hx text-[13px] leading-[1.5] text-text ring ring-surface0 outline-none focus:ring-mauve";
  return (
    <div data-component="ClipboardDemo" className="grid max-w-[1100px] grid-cols-2 gap-5 font-hx max-[760px]:grid-cols-1" onCopy={onCopy}>
      <section className="relative flex flex-col gap-2">
        <h3 className="caps m-0 flex items-center gap-1.5 text-subtext0">
          <Icon name="note" size={12} /> source
        </h3>
        <textarea className={textarea} defaultValue={SOURCE} spellCheck={false} rows={10} aria-label="source text" />
      </section>
      <section className="relative flex flex-col gap-2">
        <h3 className="caps m-0 flex items-center gap-1.5 text-subtext0">
          <Icon name="code" size={12} /> editor
          <span className="flex-1" />
          <button type="button" className="unbutton inline-flex cursor-pointer items-center gap-1 tracking-normal text-subtext0 normal-case" onClick={openPanel}>
            <Kbd>CTRL</Kbd>
            <Kbd>SHIFT</Kbd>
            <Kbd>V</Kbd> history
          </button>
        </h3>
        <textarea
          ref={editor}
          className={textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onEditorKey}
          spellCheck={false}
          rows={10}
          aria-label="editor"
        />
        {open && (
          <div className="absolute top-[34px] right-0 z-5 animate-[hx-drop_.18s_var(--hx-ease)_both]">
            <ClipboardHistory items={items} onChange={setItems} onPaste={(v) => paste(v)} onClose={() => (setOpen(false), editor.current?.focus())} autoFocus />
          </div>
        )}
      </section>
    </div>
  );
}
