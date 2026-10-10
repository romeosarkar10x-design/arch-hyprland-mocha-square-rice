import { type ReactNode } from "react";
import { Visualizer } from "../data/visualizer";
import type { IconName } from "../icons";
import { MediaPlayer, demoTrack } from "../popups/media-player";
import { BrowserView } from "./browser-view";
import { CodeView } from "./code-view";
import { Terminal } from "./terminal";

/** x, y, width, height as fractions of the stage. */
export type Box = [number, number, number, number];

export interface Win {
  id: string;
  app: IconName;
  tag: string;
  box: Box;
  body: ReactNode;
}

/** The demo session: three populated workspaces, dwindle-tiled. */
export function demoLayouts(paused: boolean | undefined): Record<number, Win[]> {
  return {
    1: [
      { id: "code", app: "code", tag: "nvim", box: [0, 0, 0.58, 1], body: <CodeView /> },
      { id: "term", app: "ghostty", tag: "ghostty", box: [0.58, 0, 0.42, 0.62], body: <Terminal /> },
      {
        id: "cava",
        app: "music",
        tag: "cava",
        box: [0.58, 0.62, 0.42, 0.38],
        body: (
          <div className="absolute inset-2.5">
            <Visualizer height="100%" playing={!paused} count={40} from="mauve" to="sky" />
          </div>
        ),
      },
    ],
    2: [
      { id: "chrome", app: "chrome", tag: "google-chrome", box: [0, 0, 0.66, 1], body: <BrowserView /> },
      {
        id: "term2",
        app: "ghostty",
        tag: "ghostty",
        box: [0.66, 0, 0.34, 1],
        body: <Terminal lines={[{ cmd: "hyprctl clients | rg class" }, { out: "\tclass: google-chrome\n\tclass: com.mitchellh.ghostty" }]} />,
      },
    ],
    3: [
      {
        id: "spotify",
        app: "spotify",
        tag: "spotify",
        box: [0.18, 0.12, 0.64, 0.76],
        body: (
          <div className="grid h-full grid-rows-[auto_1fr] gap-5 p-6">
            <MediaPlayer track={demoTrack} position={97} />
            <Visualizer height={180} variant="mirror" from="green" to="teal" playing={!paused} className="bg-transparent" />
          </div>
        ),
      },
    ],
  };
}

/** Window title shown in the bar for the focused window. */
export function titleFor(wins: Win[] | undefined, focused: string | undefined) {
  const w = wins?.find((x) => x.id === focused);
  if (!w) return "";
  const titles: Record<string, string> = {
    code: "nvim ~/dotfiles/hyprland/.config/hypr/hyprland.lua",
    term: "ghostty — ~/dotfiles",
    cava: "cava",
    chrome: "romeosarkar10x/dotfiles — Google Chrome",
    term2: "ghostty — ~",
    spotify: "Spotify Premium",
  };
  return titles[w.id] ?? w.tag;
}

/** Stage-relative position with Hyprland gaps: 6px at the screen edge, 3px between windows. */
export function place([x, y, w, h]: Box) {
  const g = 6,
    gi = 3;
  const l = x === 0 ? g : gi,
    t = y === 0 ? g : gi,
    r = x + w >= 0.999 ? g : gi,
    b = y + h >= 0.999 ? g : gi;
  return {
    left: `calc(${x * 100}% + ${l}px)`,
    top: `calc(${y * 100}% + ${t}px)`,
    width: `calc(${w * 100}% - ${l + r}px)`,
    height: `calc(${h * 100}% - ${t + b}px)`,
  };
}
