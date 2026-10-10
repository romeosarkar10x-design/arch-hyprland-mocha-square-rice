import { useEffect, useState, type ReactNode } from "react";
import { Desktop, Osd, cx, type DesktopExtra, type Popup, type QuickPage } from "../ui";
import { TaskManager } from "../taskmgr/task-manager";
import { TerminalEmulator } from "../terminal/terminal-emulator";
import { ScaleToFit } from "../theme/theme-generator";
import { BatteryPanel } from "./battery-panel";
import { ClipboardManager } from "./clipboard-manager";
import { Dmenu } from "./dmenu";
import { Greeter } from "./greeter";
import { KeybindCheatsheet } from "./keybind-cheatsheet";
import { LockScreen } from "./lock-screen";
import { demoNotifications, NotificationCenter } from "./notification-center";
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

// These layers are bar popups, so they open through the Desktop and obey its one-popup rule.
const POPUP_LAYERS: Partial<Record<RiceOverlay, { popup: Popup; page?: QuickPage }>> = {
  notifications: { popup: "notifications" },
  wifi: { popup: "qs", page: "wifi" },
  bluetooth: { popup: "qs", page: "bluetooth" },
  battery: { popup: "battery" },
};

/** The whole rice at 1920×1080: the kit's <Desktop> plus each extension layer where it really appears. */
export function Rice({ overlay = "none", workspace = 1 }: RiceProps) {
  const [notes, setNotes] = useState(demoNotifications);
  const [dnd, setDnd] = useState(false);
  // Opening any bar popup takes down the story's extension layer, so only one thing is ever open.
  const [layerShown, setLayerShown] = useState(true);
  const [prevOverlay, setPrevOverlay] = useState(overlay);
  if (prevOverlay !== overlay) {
    setPrevOverlay(overlay);
    setLayerShown(true);
  }
  const hide = () => setLayerShown(false);
  // Esc takes the layer down wherever focus is (layers like dmenu keep it on the page).
  useEffect(() => {
    if (!layerShown) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLayerShown(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layerShown]);
  /** Scrimmed layers close on a click on the scrim itself. */
  const scrimmed = (node: ReactNode) => (
    <div className={cx(centre, scrim)} onPointerDown={(e) => e.target === e.currentTarget && hide()}>
      {node}
    </div>
  );
  const extras: DesktopExtra[] = [
    {
      id: "notifications",
      sheet: true,
      segment: {
        icon: dnd ? "bellOff" : "bell",
        label: "Notifications",
        accent: notes.length && !dnd ? "mauve" : "text",
        dim: dnd,
        children: notes.length > 0 && <span className="min-w-[26px] bg-mauve px-1 text-center text-[11px] leading-[18px] font-bold text-crust">{notes.length}</span>,
      },
      render: () => <NotificationCenter height="100%" sliders={false} notifications={notes} dnd={dnd} onItemsChange={setNotes} onDndChange={setDnd} />,
    },
    // No bar segment (this desktop has no battery); opened by the "battery" layer only.
    { id: "battery", render: () => <BatteryPanel /> },
  ];

  const layers: Partial<Record<RiceOverlay, ReactNode>> = {
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
    clipboard: scrimmed(<ClipboardManager width={640} />),
    keybinds: scrimmed(<KeybindCheatsheet width={1240} />),
    switcher: <div className={centre}><WindowSwitcher /></div>,
    overview: <div className={full}><Overview width={W} height={H} active={workspace} /></div>,
    osd: <div className={at} style={{ left: 0, right: 0, bottom: 96, display: "flex", justifyContent: "center" }}><Osd value={72} /></div>,
    polkit: scrimmed(<PolkitPrompt />),
    lock: <div className={full}><LockScreen width={W} height={H} /></div>,
    greeter: <div className={full}><Greeter width={W} height={H} /></div>,
  };
  const asPopup = POPUP_LAYERS[overlay];
  return (
    <ScaleToFit width={W} height={H}>
      <div
        data-component="Rice"
        className="relative h-[1080px] w-[1920px]"
      >
        <Desktop
          wallpaper="image"
          workspace={workspace}
          notifications={overlay === "none"}
          extras={extras}
          openPopup={asPopup?.popup ?? null}
          qsPage={asPopup?.page}
          onPopupChange={(id) => id && hide()}
        />
        {layerShown && layers[overlay]}
      </div>
    </ScaleToFit>
  );
}
