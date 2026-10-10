import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx, useInterval } from "../lib";
import { Launcher } from "../overlays/launcher";
import { PowerMenu } from "../overlays/power-menu";
import { Toast, type ToastProps } from "../overlays/toast";
import { ToastStack } from "../overlays/toast-stack";
import { AudioPanel } from "../popups/audio-panel";
import { ClockPanel } from "../popups/clock-panel";
import { CpuPanel } from "../popups/cpu-panel";
import { GpuPanel } from "../popups/gpu-panel";
import { MediaPlayer, demoTrack } from "../popups/media-player";
import { MemoryPanel } from "../popups/memory-panel";
import { NetworkPanel } from "../popups/network-panel";
import { QuickSettings } from "../popups/quick-settings";
import { useSystemStats, type SystemStats } from "../stats";
import { DesktopBar } from "./desktop-bar";
import { demoLayouts, titleFor } from "./desktop-layouts";
import { DesktopStage } from "./desktop-stage";
import { Wallpaper } from "./wallpaper";

export type Popup = "clock" | "cpu" | "gpu" | "power" | "launcher" | "media" | "mem" | "net" | "audio" | "qs";

export interface DesktopProps {
  /** Workspace shown first. */
  workspace?: number;
  /** Popup open on load: cpu, gpu, mem, net, audio, clock, qs, media, power or launcher. */
  openPopup?: Popup | null;
  /** Show demo notifications a few seconds after load. */
  notifications?: boolean;
  /** Freeze live data (for screenshots). */
  paused?: boolean;
  /** Wallpaper variant. */
  wallpaper?: "image" | "aurora" | "tiles";
  width?: string | number;
  height?: string | number;
  className?: string;
}

/** The whole desktop, interactive: wallpaper, live Waybar, dwindle-tiled windows per workspace with the animated focus border, popups anchored under their segments, launcher, power menu and notifications. */
export function Desktop({
  workspace = 1,
  openPopup = null,
  notifications = true,
  paused,
  wallpaper = "aurora",
  width = 1920,
  height = 1080,
  className,
}: DesktopProps) {
  const stats = useSystemStats(paused);
  const [ws, setWs] = useState(workspace);
  const [popup, setPopup] = useState(openPopup);
  const [anchor, setAnchor] = useState<{ left: number; right: number } | null>(null);
  const [focus, setFocus] = useState<Record<number, string>>({ 1: "code", 2: "chrome", 3: "spotify" });
  const [caffeine, setCaffeine] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const { toasts, dismiss } = useDemoToasts(notifications);
  const root = useRef<HTMLDivElement>(null);
  const segs = useRef<Partial<Record<Popup, HTMLButtonElement | null>>>({});
  useInterval(() => setClock(new Date()), paused ? null : 1000);
  const open = (id: Popup, force = false) => {
    if (!force && popup === id) {
      setPopup(null);
      return;
    }
    const el = segs.current[id];
    const host = root.current;
    if (el && host) {
      const r = el.getBoundingClientRect();
      const h = host.getBoundingClientRect();
      setAnchor({ left: r.left - h.left, right: h.right - r.right });
    } else setAnchor(null);
    setPopup(id);
  };
  useLayoutEffect(() => {
    if (openPopup) open(openPopup, true);
  }, [openPopup]);
  const layouts = demoLayouts(paused);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) {
        if (e.key === "Escape") setPopup(null);
        return;
      }
      if (e.key === "Escape") setPopup(null);
      else if (e.key === "/" || (e.metaKey && e.key.toLowerCase() === "r")) {
        e.preventDefault();
        open("launcher");
      } else if (/^[1-9]$/.test(e.key)) setWs(Number(e.key));
    };
    const el = root.current;
    el?.addEventListener("keydown", onKey);
    return () => el?.removeEventListener("keydown", onKey);
  }, [popup]);
  const popupNode = barPopup(popup, stats);
  const centred = popup === "clock" || popup === "media";
  const overlay = popup === "launcher" || popup === "power";
  return (
    <div
      ref={root}
      data-component="Desktop"
      className={cx("kit-type focus-ring relative isolate overflow-hidden bg-crust text-[13px] text-text outline-none", className)}
      style={{ width, height }}
      tabIndex={0}
      onPointerDown={(e) => {
        if (e.target === root.current) root.current?.focus();
      }}
    >
      <Wallpaper variant={wallpaper} />
      <DesktopBar
        stats={stats}
        layouts={layouts}
        workspace={ws}
        onWorkspace={(id) => {
          setWs(id);
          setPopup(null);
        }}
        title={titleFor(layouts[ws], focus[ws])}
        clock={clock}
        popup={popup}
        onPopup={open}
        segmentRef={(id) => (el) => {
          segs.current[id] = el;
        }}
        caffeine={caffeine}
        onCaffeine={() => setCaffeine(!caffeine)}
      />
      <DesktopStage layouts={layouts} workspace={ws} focus={focus} onFocus={(w, id) => setFocus({ ...focus, [w]: id })} />
      {popup && (
        <div
          className={cx("absolute inset-0 z-19", overlay && "animate-[hx-fade_.2s_both] bg-[rgba(17,17,27,.5)] backdrop-blur-[4px]")}
          onPointerDown={() => setPopup(null)}
        />
      )}
      {popupNode && (
        <PopupLayer
          key={popup}
          style={
            centred
              ? { left: "50%", transform: "translateX(-50%)" }
              : anchor && anchor.left < 400
                ? { left: Math.max(6, anchor.left) }
                : { right: Math.max(6, anchor?.right ?? 6) }
          }
        >
          {popupNode}
        </PopupLayer>
      )}
      {popup === "launcher" && (
        <PopupLayer key="launcher" centre>
          <Launcher onClose={() => setPopup(null)} onLaunch={() => setPopup(null)} />
        </PopupLayer>
      )}
      {popup === "power" && (
        <PopupLayer key="power" centre>
          <PowerMenu onAction={() => setTimeout(() => setPopup(null), 700)} />
        </PopupLayer>
      )}
      <ToastStack className="absolute top-[calc(var(--hx-bar-height)+14px)] right-2.5 z-30">
        {toasts.map(({ id, ...t }) => (
          <Toast key={id} {...t} onClose={() => dismiss(id)} />
        ))}
      </ToastStack>
    </div>
  );
}

/** The dropdown for a bar segment, fed from the desktop's live stats. */
function barPopup(popup: Popup | null, { cpu, gpu, mem, net }: SystemStats) {
  switch (popup) {
    case "cpu":
      return <CpuPanel data={cpu} />;
    case "gpu":
      return <GpuPanel data={gpu} />;
    case "mem":
      return <MemoryPanel data={mem} />;
    case "net":
      return <NetworkPanel data={net} />;
    case "audio":
      return <AudioPanel />;
    case "clock":
      return <ClockPanel />;
    case "qs":
      return <QuickSettings />;
    case "media":
      return <MediaPopup />;
    default:
      return null;
  }
}

/** Positioned layer for a popup: dropped under the bar, or popped in at the upper middle (`centre`). */
function PopupLayer({ centre, style, children }: { centre?: boolean; style?: CSSProperties; children: ReactNode }) {
  return (
    <div
      data-component="PopupLayer"
      className={cx(
        "absolute z-20",
        // hx-pop animates `transform`, so the centring offset has to live in `transform` too
        centre ? "top-[22%] left-1/2 animate-pop [transform:translateX(-50%)]" : "top-[calc(var(--hx-bar-height)+var(--hx-border-bar)+6px)] animate-drop",
      )}
      style={style}
    >
      {children}
    </div>
  );
}

function MediaPopup() {
  return (
    <div data-component="MediaPopup" className="kit-type w-[380px] border-t-2 border-green bg-mantle p-4 text-text shadow-popup ring ring-surface0">
      <MediaPlayer track={demoTrack} position={97} />
    </div>
  );
}

type DemoToast = ToastProps & { id: number };

/** Two demo notifications that arrive a few seconds after load. */
function useDemoToasts(enabled: boolean) {
  const [toasts, setToasts] = useState<DemoToast[]>([]);
  useEffect(() => {
    if (!enabled) return;
    const a = setTimeout(
      () =>
        setToasts((t) => [
          ...t,
          {
            id: 1,
            app: "Spotify",
            appIcon: "spotify",
            accent: "green",
            title: demoTrack.title,
            body: `${demoTrack.artist} — ${demoTrack.album}`,
            timeout: 7000,
          },
        ]),
      1200,
    );
    const b = setTimeout(
      () =>
        setToasts((t) => [
          ...t,
          {
            id: 2,
            app: "pacman",
            appIcon: "package",
            accent: "sapphire",
            title: "14 updates available",
            body: "linux 7.2.3 · mesa · hyprland-git · waybar-git …",
            time: "now",
            actions: [{ label: "Update" }, { label: "Later" }],
            timeout: 12000,
          },
        ]),
      3800,
    );
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [enabled]);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  return { toasts, dismiss };
}
