import { useCallback, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BarSegment, Desktop } from "../ui";
import { TaskManager } from "../taskmgr/TaskManager";
import { TerminalEmulator } from "../terminal/TerminalEmulator";
import { ScaleToFit } from "../theme/ThemeGenerator";
import { BatteryPanel } from "./BatteryPanel";
import { ClipboardManager } from "./ClipboardManager";
import { BluetoothMenu, WifiMenu } from "./Connections";
import { Dmenu } from "./Dmenu";
import { Greeter } from "./Greeter";
import { KeybindCheatsheet } from "./KeybindCheatsheet";
import { LockScreen } from "./LockScreen";
import { demoNotifications, NotificationCenter } from "./NotificationCenter";
import { Osd } from "./Osd";
import { Overview } from "./Overview";
import { PolkitPrompt } from "./PolkitPrompt";
import { WindowSwitcher } from "./WindowSwitcher";
import "./shell.css";

export const RICE_OVERLAYS = [
  "none", "terminal", "taskmanager", "dmenu", "clipboard", "keybinds", "switcher", "overview", "notifications",
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
  // The notification centre is toggled by a bell in the bar, like swaync-client -t.
  const [ncOpen, setNcOpen] = useState(overlay === "notifications");
  const [prevOverlay, setPrevOverlay] = useState(overlay);
  if (prevOverlay !== overlay) {
    setPrevOverlay(overlay);
    setNcOpen(overlay === "notifications");
  }
  const [notes, setNotes] = useState(demoNotifications);
  const [dnd, setDnd] = useState(false);
  const [bellSlot, barRef] = useBarSlot();
  const layer = ncOpen ? "notifications" : overlay === "notifications" ? "none" : overlay;

  const layers: Record<RiceOverlay, ReactNode> = {
    none: null,
    terminal: (
      <div className="rx-rice-at" style={{ left: 560, top: 200 }}>
        <TerminalEmulator backdrop={false} width={800} height={540} program="fastfetch" tabs={["zsh"]} />
      </div>
    ),
    taskmanager: (
      <div className="rx-rice-at" style={{ left: 260, top: 110 }}>
        <TaskManager width={1400} height={860} />
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
      <>
        <div className="rx-rice-dismiss" onPointerDown={() => setNcOpen(false)} />
        <div className="rx-rice-at rx-rice-nc" style={{ right: 6, top: 42, bottom: 6 }}>
          <NotificationCenter height="100%" notifications={notes} dnd={dnd} onItemsChange={setNotes} onDndChange={setDnd} />
        </div>
      </>
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
      <div
        className="rx-rice"
        ref={barRef}
        onKeyDown={(e) => {
          if (e.key === "Escape" && ncOpen) setNcOpen(false);
        }}
      >
        <Desktop wallpaper="image" workspace={workspace} notifications={overlay === "none"} />
        {layers[layer]}
        {bellSlot &&
          createPortal(
            <BarSegment
              icon={dnd ? "bellOff" : "bell"}
              accent={notes.length && !dnd ? "mauve" : "text"}
              dim={dnd}
              divider
              open={ncOpen}
              label="Notifications"
              className="rx-rice-bell"
              onClick={() => setNcOpen((o) => !o)}
            >
              {notes.length > 0 && <span className="rx-rice-bell-n">{notes.length}</span>}
            </BarSegment>,
            bellSlot,
          )}
      </div>
    </ScaleToFit>
  );
}

/**
 * The kit's <Desktop> builds its bar internally, so the bell is portalled into a slot
 * inserted just before the power button.
 */
function useBarSlot() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const ref = useCallback((root: HTMLDivElement | null) => {
    const power = root?.querySelector(".hx-bar-right > .hx-seg--power");
    if (!power) return;
    const el = document.createElement("span");
    el.className = "rx-rice-slot";
    power.before(el);
    setSlot(el);
    return () => {
      el.remove();
      setSlot(null);
    };
  }, []);
  return [slot, ref] as const;
}
