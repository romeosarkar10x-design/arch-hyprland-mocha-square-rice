import { useCallback, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BarSegment, Desktop, cx } from "../ui";
import { TaskManager } from "../taskmgr/task-manager";
import { TerminalEmulator } from "../terminal/terminal-emulator";
import { ScaleToFit } from "../theme/theme-generator";
import { BatteryPanel } from "./battery-panel";
import { ClipboardManager } from "./clipboard-manager";
import { BluetoothMenu } from "./bluetooth-menu";
import { WifiMenu } from "./wifi-menu";
import { Dmenu } from "./dmenu";
import { Greeter } from "./greeter";
import { KeybindCheatsheet } from "./keybind-cheatsheet";
import { LockScreen } from "./lock-screen";
import { demoNotifications, NotificationCenter } from "./notification-center";
import { Osd } from "./osd";
import { Overview } from "./overview";
import { PolkitPrompt } from "./polkit-prompt";
import { WindowSwitcher } from "./window-switcher";

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

/** A layer pinned at fixed screen coordinates. */
const at = "absolute z-40";
const full = "absolute inset-0 z-40";
const centre = "absolute inset-0 z-40 grid place-items-center";
const scrim = "bg-crust/50 backdrop-blur-[4px]";

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
      <div className={at} style={{ left: 560, top: 200 }}>
        <TerminalEmulator backdrop={false} width={800} height={540} program="fastfetch" tabs={["zsh"]} />
      </div>
    ),
    taskmanager: (
      <div className={at} style={{ left: 260, top: 110 }}>
        <TaskManager width={1400} height={860} />
      </div>
    ),
    dmenu: (
      <div className={at} style={{ left: 0, top: 0, right: 0 }}>
        <Dmenu width="100%" query="g" />
      </div>
    ),
    clipboard: <div className={cx(centre, scrim)}><ClipboardManager width={640} /></div>,
    keybinds: <div className={cx(centre, scrim)}><KeybindCheatsheet width={1240} /></div>,
    switcher: <div className={centre}><WindowSwitcher /></div>,
    overview: <div className={full}><Overview width={W} height={H} active={workspace} /></div>,
    notifications: (
      <>
        <div className="absolute inset-[calc(var(--hx-bar-height)+var(--hx-border-bar))_0_0] z-39" onPointerDown={() => setNcOpen(false)} />
        <div className={cx(at, "animate-[rx-rice-slide_var(--hx-med)_var(--hx-ease)_both]")} style={{ right: 6, top: 42, bottom: 6 }}>
          <NotificationCenter height="100%" notifications={notes} dnd={dnd} onItemsChange={setNotes} onDndChange={setDnd} />
        </div>
      </>
    ),
    wifi: <div className={at} style={{ right: 300, top: 42 }}><WifiMenu /></div>,
    bluetooth: <div className={at} style={{ right: 260, top: 42 }}><BluetoothMenu /></div>,
    battery: <div className={at} style={{ right: 220, top: 42 }}><BatteryPanel /></div>,
    osd: <div className={at} style={{ left: 0, right: 0, bottom: 96, display: "flex", justifyContent: "center" }}><Osd value={72} /></div>,
    polkit: <div className={cx(centre, scrim)}><PolkitPrompt /></div>,
    lock: <div className={full}><LockScreen width={W} height={H} /></div>,
    greeter: <div className={full}><Greeter width={W} height={H} /></div>,
  };
  return (
    <ScaleToFit width={W} height={H}>
      <div
        data-component="Rice"
        className="relative h-[1080px] w-[1920px]"
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
              onClick={() => setNcOpen((o) => !o)}
            >
              {notes.length > 0 && <span className="min-w-[26px] bg-mauve px-1 text-center text-[11px] leading-[18px] font-bold text-crust">{notes.length}</span>}
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
    const power = root?.querySelector('[data-component="BarSegment"][data-variant="power"]');
    if (!power) return;
    const el = document.createElement("span");
    el.className = "contents";
    power.before(el);
    setSlot(el);
    return () => {
      el.remove();
      setSlot(null);
    };
  }, []);
  return [slot, ref] as const;
}
