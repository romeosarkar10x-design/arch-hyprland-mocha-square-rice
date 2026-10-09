import type { Accent, IconName } from "../ds";

export interface DemoWindow {
  id: string;
  /** Icon name. */
  icon: IconName;
  /** Window class, as `hyprctl clients` reports it. */
  cls: string;
  title: string;
  accent: Accent;
  /** Tiled position on its workspace as fractions: x, y, w, h. */
  box: [number, number, number, number];
}

export interface DemoWorkspace {
  id: number;
  windows: DemoWindow[];
}

export const demoWorkspaces: DemoWorkspace[] = [
  {
    id: 1,
    windows: [
      { id: "nvim", icon: "code", cls: "nvim", title: "src/theme/palette.ts — nvim", accent: "green", box: [0, 0, 0.58, 1] },
      { id: "ghostty", icon: "ghostty", cls: "com.mitchellh.ghostty", title: "romeo@archlinux: ~/github/rice", accent: "mauve", box: [0.58, 0, 0.42, 0.62] },
      { id: "cava", icon: "music", cls: "cava", title: "cava", accent: "teal", box: [0.58, 0.62, 0.42, 0.38] },
    ],
  },
  {
    id: 2,
    windows: [
      { id: "chrome", icon: "chrome", cls: "google-chrome", title: "Hyprland Wiki — Google Chrome", accent: "blue", box: [0, 0, 0.66, 1] },
      { id: "term2", icon: "ghostty", cls: "com.mitchellh.ghostty", title: "hyprctl clients", accent: "mauve", box: [0.66, 0, 0.34, 1] },
    ],
  },
  { id: 3, windows: [{ id: "spotify", icon: "spotify", cls: "spotify", title: "Spotify Premium", accent: "green", box: [0.12, 0.08, 0.76, 0.84] }] },
  {
    id: 4,
    windows: [
      { id: "discord", icon: "chat", cls: "vesktop", title: "#hyprland — Vesktop", accent: "lavender", box: [0, 0, 0.5, 1] },
      { id: "obsidian", icon: "note", cls: "obsidian", title: "rice notes — Obsidian", accent: "mauve", box: [0.5, 0, 0.5, 1] },
    ],
  },
  { id: 5, windows: [{ id: "steam", icon: "steam", cls: "steam", title: "Steam", accent: "sky", box: [0, 0, 1, 1] }] },
  { id: 6, windows: [] },
];
