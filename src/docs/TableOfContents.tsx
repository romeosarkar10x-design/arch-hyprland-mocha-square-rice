import { useEffect, useState } from "react";
import "./toc.css";

interface Entry {
  id: string;
  title: string;
  name: string;
  type: "story" | "docs";
}

interface Node {
  name: string;
  path: string;
  children: Map<string, Node>;
  docs?: Entry;
  stories: Entry[];
}

/** One line per section of the sidebar: what lives there. */
const NOTES: Record<string, string> = {
  Overview: "Start here.",
  Theme: "Wallpaper → palette engine, the palette itself, wallpapers, and dotfile export.",
  Hyprland: "Your hyprland.lua, live: a keyboard-driven session, window look, animation curves, keybinds.",
  Foundations: "Icons, keys, surfaces and units every other component is built from.",
  Controls: "Buttons, sliders and toggles.",
  Data: "Meters, gauges, graphs and stats for system readouts.",
  Shell: "Everything layer-shell: the bar, its popups, launchers and overlays.",
  "Shell/Bar": "Waybar: the bar, its segments, tooltips and workspaces.",
  "Shell/Popups": "Panels that drop from bar segments: CPU, GPU, memory, network, Wi-Fi, Bluetooth, battery, audio, media, calendar.",
  "Shell/Launchers": "rofi-style launcher and dmenu strip.",
  "Shell/Clipboard": "Clipboard history: Win + V-style cards with pins and emoji, and the cliphist picker.",
  "Shell/Screenshot": "Capture a region / window / output, then annotate it (satty).",
  "Shell/Overlays": "Toasts, notification centre, OSD, overview, Alt-Tab, keybind cheatsheet, keystroke visualizer.",
  Session: "Lock screen, login greeter, power menu, polkit authentication.",
  Apps: "Terminal emulators (Ghostty, kitty, Alacritty, foot, WezTerm) and their configs, editor, browser.",
  Desktop: "Full 1920×1080 compositions: the live desktop and the whole rice.",
};

// Sub-groups in desktop order (bar first, then what drops from it, then full-screen layers).
const SUB_ORDER = ["Bar", "Popups", "Launchers", "Clipboard", "Screenshot", "Overlays", "Live Session", "Window Look", "Animations", "Keybinds"];
const subRank = (name: string) => SUB_ORDER.indexOf(name) + 1 || SUB_ORDER.length + 1;

const href = (kind: "docs" | "story", id: string) => `./?path=/${kind}/${id}`;

function build(entries: Entry[]): Node {
  const root: Node = { name: "", path: "", children: new Map(), stories: [] };
  for (const e of entries) {
    let node = root;
    for (const part of e.title.split("/")) {
      const path = node.path ? `${node.path}/${part}` : part;
      if (!node.children.has(part)) node.children.set(part, { name: part, path, children: new Map(), stories: [] });
      node = node.children.get(part)!;
    }
    if (e.type === "docs") node.docs = e;
    else node.stories.push(e);
  }
  return root;
}

const count = (n: Node): number => (n.docs || n.stories.length ? 1 : 0) + [...n.children.values()].reduce((s, c) => s + count(c), 0);

function Leaf({ node }: { node: Node }) {
  const target = node.docs ?? node.stories[0];
  return (
    <li className="rx-toc-leaf">
      {target ? (
        <a href={href(node.docs ? "docs" : "story", target.id)} target="_top">
          {node.name}
        </a>
      ) : (
        node.name
      )}
      {node.stories.length > 0 && (
        <span className="rx-toc-stories">
          {node.stories.map((s) => (
            <a key={s.id} href={href("story", s.id)} target="_top">
              {s.name}
            </a>
          ))}
        </span>
      )}
    </li>
  );
}

function Branch({ node, depth }: { node: Node; depth: number }) {
  const kids = [...node.children.values()].sort((a, b) => subRank(a.name) - subRank(b.name) || a.name.localeCompare(b.name));
  const leaves = kids.filter((k) => k.children.size === 0);
  const branches = kids.filter((k) => k.children.size > 0);
  return (
    <details open={depth < 2} className={`rx-toc-branch rx-toc-d${depth}`}>
      <summary>
        <span className="rx-toc-name">{node.name}</span>
        <span className="rx-toc-count">{count(node)}</span>
        {NOTES[node.path] && <span className="rx-toc-note">{NOTES[node.path]}</span>}
      </summary>
      {leaves.length > 0 && (
        <ul className="rx-toc-leaves">
          {leaves.map((l) => (
            <Leaf key={l.path} node={l} />
          ))}
        </ul>
      )}
      {branches.map((b) => (
        <Branch key={b.path} node={b} depth={depth + 1} />
      ))}
    </details>
  );
}

/**
 * The whole Storybook as a collapsible tree (section → group → component → stories),
 * read live from Storybook's index, so it never goes stale.
 */
export function TableOfContents({ order }: { order: string[] }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch("./index.json")
      .then((r) => r.json() as Promise<{ entries: Record<string, Entry> }>)
      .then((j) => setEntries(Object.values(j.entries)))
      .catch((e: unknown) => setError(String(e)));
  }, []);
  if (error) return <p>Couldn't load the story index: {error}</p>;
  if (!entries) return <p>Loading…</p>;
  const tree = build(entries.filter((e) => !e.title.startsWith("Overview/")));
  const rank = (name: string) => (order.indexOf(name) + 1 || order.length + 1);
  const sections = [...tree.children.values()].sort((a, b) => rank(a.name) - rank(b.name));
  const components = count(tree);
  const stories = entries.filter((e) => e.type === "story").length;
  return (
    <nav className="rx-toc" aria-label="Table of contents">
      <p className="rx-toc-sum">
        {sections.length} sections · {components} components · {stories} stories
      </p>
      {sections.map((s) => (
        <Branch key={s.path} node={s} depth={0} />
      ))}
    </nav>
  );
}
