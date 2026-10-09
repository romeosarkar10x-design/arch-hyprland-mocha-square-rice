import type { ReactNode } from "react";
import { Desktop } from "../ds";
import { TerminalEmulator } from "../terminal/TerminalEmulator";
import { ScaleToFit } from "../theme/ThemeGenerator";
import { BatteryPanel } from "./BatteryPanel";
import { ClipboardManager } from "./ClipboardManager";
import { BluetoothMenu, WifiMenu } from "./Connections";
import { Dmenu } from "./Dmenu";
import { Greeter } from "./Greeter";
import { KeybindCheatsheet } from "./KeybindCheatsheet";
import { LockScreen } from "./LockScreen";
import { NotificationCenter } from "./NotificationCenter";
import { Osd } from "./Osd";
import { Overview } from "./Overview";
import { PolkitPrompt } from "./PolkitPrompt";
import { WindowSwitcher } from "./WindowSwitcher";
import "./shell.css";

export const RICE_OVERLAYS = [
  "none", "terminal", "dmenu", "clipboard", "keybinds", "switcher", "overview", "notifications",
  "wifi", "bluetooth", "battery", "osd", "polkit", "lock", "greeter",
] as const;
export type RiceOverlay = (typeof RICE_OVERLAYS)[number];

export interface RiceProps {
  /** Which extension layer to show over the desktop. */
  overlay?: RiceOverlay;
  /** Desktop workspace (1-3 have windows). */
  workspace?: number;
}

const W = 1920, H = 1080;

/** The whole rice at 1920×1080: the kit's <Desktop> plus each extension layer where it really appears. */
export function Rice({ overlay = "none", workspace = 1 }: RiceProps) {
  const layers: Record<RiceOverlay, ReactNode> = {
    none: null,
    terminal: (
      <div className="rx-rice-at" style={{ left: 560, top: 200 }}>
        <TerminalEmulator backdrop={false} width={800} height={540} program="fastfetch" tabs={["zsh"]} />
      </div>
    ),
    dmenu: (
      <div className="rx-rice-at" style={{ left: 0, top: 0, right: 0 }}>
        <Dmenu width="100%" query="g" />
      </div>
    ),
    clipboard: <div className="rx-rice-center rx-rice-scrim"><ClipboardManager width={640} /></div>,
    keybinds: <div className="rx-rice-center rx-rice-scrim"><KeybindCheatsheet width={1240} /></div>,
    switcher: <div className="rx-rice-center"><WindowSwitcher /></div>,
    overview: <div className="rx-rice-full"><Overview width={W} height={H} active={workspace} /></div>,
    notifications: (
      <div className="rx-rice-at" style={{ right: 6, top: 42, bottom: 6 }}>
        <NotificationCenter height="100%" />
      </div>
    ),
    wifi: <div className="rx-rice-at" style={{ right: 300, top: 42 }}><WifiMenu /></div>,
    bluetooth: <div className="rx-rice-at" style={{ right: 260, top: 42 }}><BluetoothMenu /></div>,
    battery: <div className="rx-rice-at" style={{ right: 220, top: 42 }}><BatteryPanel /></div>,
    osd: <div className="rx-rice-at" style={{ left: 0, right: 0, bottom: 96, display: "flex", justifyContent: "center" }}><Osd value={72} /></div>,
    polkit: <div className="rx-rice-center rx-rice-scrim"><PolkitPrompt /></div>,
    lock: <div className="rx-rice-full"><LockScreen width={W} height={H} /></div>,
    greeter: <div className="rx-rice-full"><Greeter width={W} height={H} /></div>,
  };
  return (
    <ScaleToFit width={W} height={H}>
      <div className="rx-rice">
        <Desktop wallpaper="image" workspace={workspace} notifications={overlay === "none"} />
        {layers[overlay]}
      </div>
    </ScaleToFit>
  );
}
