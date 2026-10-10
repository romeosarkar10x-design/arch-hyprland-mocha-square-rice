import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { bytes, clamp, cx, kelvinRgb, rate, useInterval, type Accent } from "../lib";
import { Tooltip, type TooltipProps } from "../bar/tooltip";
import { type IconName } from "../icons";
import { Launcher } from "../overlays/launcher";
import { Osd, type OsdKind } from "../overlays/osd";
import { PowerMenu } from "../overlays/power-menu";
import { Toast, type ToastProps } from "../overlays/toast";
import { ToastStack } from "../overlays/toast-stack";
import { ClockPanel } from "../popups/clock-panel";
import { CpuPanel } from "../popups/cpu-panel";
import { GpuPanel } from "../popups/gpu-panel";
import { MediaPlayer, demoTrack } from "../popups/media-player";
import { MemoryPanel } from "../popups/memory-panel";
import { NetworkPanel } from "../popups/network-panel";
import { QuickSettings, defaultNightLight, defaultTiles, type NightLight, type QuickPage } from "../popups/quick-settings";
import { useSystemStats, type SystemStats } from "../stats";
import { DesktopBar } from "./desktop-bar";
import { demoLayouts, titleFor } from "./desktop-layouts";
import { DesktopStage } from "./desktop-stage";
import { Wallpaper } from "./wallpaper";

/** A built-in bar popup, or the id of a `DesktopExtra`. */
export type Popup = "clock" | "cpu" | "gpu" | "power" | "launcher" | "media" | "mem" | "net" | "qs" | (string & {});

/** A popup the host app adds to the desktop (e.g. a notification centre). It takes part in the one-popup-at-a-time rule and hover switching. */
export interface DesktopExtra {
  id: string;
  /** Bar segment inserted before the power button. Omit for a popup that only opens through `openPopup`. */
  segment?: { icon: IconName; label: string; accent?: Accent; dim?: boolean; children?: ReactNode };
  /** Popup body. */
  render: () => ReactNode;
  /** Full-height sheet on the right edge instead of a dropdown under the segment. */
  sheet?: boolean;
}

/** A segment's edges, measured from the desktop's left and right. */
type Anchor = { left: number; right: number };

export interface DesktopProps {
  /** Workspace shown first. */
  workspace?: number;
  /** Popup open on load (and whenever this changes): cpu, gpu, mem, net, clock, qs, media, power, launcher or an extra's id. */
  openPopup?: Popup | null;
  /** Quick-settings page shown when `openPopup` is "qs". */
  qsPage?: QuickPage;
  /** Called whenever the open popup changes (null when closed). */
  onPopupChange?: (id: Popup | null) => void;
  /** Host-supplied bar segments and popups. */
  extras?: DesktopExtra[];
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

// Launcher and power menu are centred modals: they dim the screen and never take part in hover switching.
const MODAL = new Set<Popup>(["launcher", "power"]);
const CENTRED = new Set<Popup>(["clock", "media"]);
/** Hovering another segment while a popup is open switches to it after this long. */
const SWITCH_MS = 70;
/** A click on a segment this soon after hover opened it keeps it open rather than toggling it shut. */
const HOVER_CLICK_GRACE_MS = 600;

/**
 * The whole desktop, interactive: wallpaper, live Waybar with hover tooltips, dwindle-tiled windows per workspace with the animated focus border,
 * popups anchored under their segments, quick settings, volume / brightness OSD, night-light tint, launcher, power menu and notifications.
 * One popup at a time: while one is open, hovering another segment morphs the popup over to it. Click outside or Esc closes.
 * Volume: media keys, + / - / m, or scroll on the quick-settings icon.
 */
export function Desktop({
  workspace = 1,
  openPopup = null,
  qsPage,
  onPopupChange,
  extras = [],
  notifications = true,
  paused,
  wallpaper = "aurora",
  width = 1920,
  height = 1080,
  className,
}: DesktopProps) {
  const stats = useSystemStats(paused);
  const [ws, setWs] = useState(workspace);
  const [view, setView] = useState<{ id: Popup | null; anchor: Anchor | null; dir: -1 | 0 | 1 }>({ id: null, anchor: null, dir: 0 });
  const popup = view.id;
  const [firstQsPage, setFirstQsPage] = useState<QuickPage | undefined>(undefined);
  const [focus, setFocus] = useState<Record<number, string>>({ 1: "code", 2: "chrome", 3: "spotify" });
  const [caffeine, setCaffeine] = useState(false);
  const [volume, setVolume] = useState(64);
  const [muted, setMuted] = useState(false);
  const [brightness, setBrightness] = useState(72);
  const [night, setNight] = useState<NightLight>(defaultNightLight);
  const [osd, setOsd] = useState<{ kind: OsdKind; value: number; muted?: boolean; n: number } | null>(null);
  const [tip, setTip] = useState<{ id: Popup; anchor: Anchor | null } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hoverOpened = useRef<{ id: Popup; at: number } | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const { toasts, dismiss } = useDemoToasts(notifications);
  const root = useRef<HTMLDivElement>(null);
  const segs = useRef<Partial<Record<Popup, HTMLButtonElement | null>>>({});
  useInterval(() => setClock(new Date()), paused ? null : 1000);
  const extra = (id: Popup | null) => extras.find((x) => x.id === id);
  const isModal = (id: Popup | null) => id != null && MODAL.has(id);
  const measure = (id: Popup): Anchor | null => {
    const el = segs.current[id];
    const host = root.current;
    if (!el || !host) return null;
    const r = el.getBoundingClientRect();
    const h = host.getBoundingClientRect();
    // Client rects are post-transform; divide out any scale (e.g. ScaleToFit) to get desktop pixels.
    const k = host.offsetWidth / h.width || 1;
    return { left: (r.left - h.left) * k, right: (h.right - r.right) * k };
  };
  const show = (id: Popup | null) => {
    clearTimeout(hoverTimer.current);
    setTip(null);
    if (id === popup) return;
    const anchor = id ? measure(id) : null;
    // Slide the new content in from the side the pointer travelled from.
    const dir = anchor && view.anchor && popup && !isModal(popup) ? (anchor.left > view.anchor.left ? 1 : -1) : 0;
    setView({ id, anchor, dir });
    onPopupChange?.(id);
  };
  const close = () => show(null);
  const toggle = (id: Popup) => {
    const h = hoverOpened.current;
    hoverOpened.current = null;
    if (popup === id && h?.id === id && performance.now() - h.at < HOVER_CLICK_GRACE_MS) return;
    setFirstQsPage(undefined);
    show(popup === id ? null : id);
  };
  const hover = (id: Popup | null) => {
    clearTimeout(hoverTimer.current);
    if (popup && !isModal(popup)) {
      // Menubar behaviour: with a popup open, pointing at another popup's segment switches to it.
      if (id && id !== popup && !isModal(id))
        hoverTimer.current = setTimeout(() => {
          hoverOpened.current = { id, at: performance.now() };
          setFirstQsPage(undefined);
          show(id);
        }, SWITCH_MS);
      return;
    }
    if (!id) setTip(null);
    else hoverTimer.current = setTimeout(() => setTip({ id, anchor: measure(id) }), 450);
  };
  useEffect(() => () => clearTimeout(hoverTimer.current), []);
  const showOsd = (kind: OsdKind, value: number, isMuted?: boolean) => setOsd((o) => ({ kind, value, muted: isMuted, n: (o?.n ?? 0) + 1 }));
  useEffect(() => {
    if (!osd) return;
    const t = setTimeout(() => setOsd(null), 1500);
    return () => clearTimeout(t);
  }, [osd]);
  const stepVolume = (dir: 1 | -1) => {
    const v = clamp(volume + dir * 2);
    setVolume(v);
    showOsd("volume", v, muted);
  };
  const toggleMute = () => {
    setMuted(!muted);
    showOsd("volume", volume, !muted);
  };
  const stepBrightness = (dir: 1 | -1) => {
    const v = clamp(brightness + dir * 5);
    setBrightness(v);
    showOsd("brightness", v);
  };
  useLayoutEffect(() => {
    setFirstQsPage(openPopup === "qs" ? qsPage : undefined);
    setView({ id: openPopup, anchor: openPopup ? measure(openPopup) : null, dir: 0 });
  }, [openPopup, qsPage]);
  const layouts = demoLayouts(paused);
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) {
      if (e.key === "Escape") close();
      return;
    }
    if (e.key === "Escape") close();
    else if (e.key === "/" || (e.metaKey && e.key.toLowerCase() === "r")) {
      e.preventDefault();
      toggle("launcher");
    } else if (/^[1-9]$/.test(e.key)) setWs(Number(e.key));
    // Media keys where the browser passes them through; + / - / m stand in for them.
    else if (e.key === "AudioVolumeUp" || e.key === "+" || e.key === "=") stepVolume(1);
    else if (e.key === "AudioVolumeDown" || e.key === "-") stepVolume(-1);
    else if (e.key === "AudioVolumeMute" || e.key === "m") toggleMute();
    else if (e.key === "BrightnessUp") stepBrightness(1);
    else if (e.key === "BrightnessDown") stepBrightness(-1);
    else return;
    e.preventDefault();
  };
  // The listener is attached once and always calls the latest handler.
  const keyRef = useRef(onKey);
  keyRef.current = onKey;
  useEffect(() => {
    const handle = (e: KeyboardEvent) => keyRef.current(e);
    const el = root.current;
    el?.addEventListener("keydown", handle);
    return () => el?.removeEventListener("keydown", handle);
  }, []);
  const x = extra(popup);
  const popupNode =
    popup === "qs" ? (
      <QuickSettings
        page={firstQsPage}
        volume={volume}
        muted={muted}
        onVolumeChange={setVolume}
        onMutedChange={setMuted}
        brightness={brightness}
        onBrightnessChange={setBrightness}
        nightLight={night}
        onNightLightChange={setNight}
        tiles={defaultTiles.map((t) => (t.id === "caffeine" ? { ...t, on: caffeine } : t))}
        onToggle={(id, on) => id === "caffeine" && setCaffeine(on)}
      />
    ) : x ? (
      x.render()
    ) : (
      barPopup(popup, stats)
    );
  const sheet = !!x?.sheet;
  const tipProps = tip && !popup ? barTooltip(tip.id, stats, { volume, muted, brightness, night }) : null;
  const [r, g, b] = kelvinRgb(night.temp);
  const dim = night.brightness / 100;
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
      onPointerDownCapture={(e) => {
        // Click-outside for dropdowns; segments and the popup itself don't count, so clicking another segment switches.
        if (!popup || isModal(popup)) return;
        const t = e.target as Node;
        if ((t as Element).closest?.("[data-popup-layer]")) return;
        if (Object.values(segs.current).some((el) => el?.contains(t))) return;
        close();
      }}
    >
      <Wallpaper variant={wallpaper} />
      <DesktopBar
        stats={stats}
        layouts={layouts}
        workspace={ws}
        onWorkspace={(id) => {
          setWs(id);
          close();
        }}
        title={titleFor(layouts[ws], focus[ws])}
        clock={clock}
        popup={popup}
        onPopup={toggle}
        segmentRef={(id) => (el) => {
          segs.current[id] = el;
        }}
        onHover={hover}
        onVolumeWheel={stepVolume}
        caffeine={caffeine}
        onCaffeine={() => setCaffeine(!caffeine)}
        extras={extras}
      />
      <DesktopStage layouts={layouts} workspace={ws} focus={focus} onFocus={(w, id) => setFocus({ ...focus, [w]: id })} />
      {/* Toasts step aside while a popup is open, so nothing ever stacks on top of it. */}
      <ToastStack
        className={cx(
          "absolute top-[calc(var(--hx-bar-height)+14px)] right-2.5 z-20 transition-opacity duration-(--hx-med)",
          popup && "pointer-events-none opacity-0",
        )}
      >
        {toasts.map(({ id, ...t }) => (
          <Toast key={id} {...t} onClose={() => dismiss(id)} />
        ))}
      </ToastStack>
      {popupNode && !isModal(popup) && !sheet && (
        <PopupViewport id={popup!} anchor={view.anchor} dir={view.dir} centred={CENTRED.has(popup!)} host={root}>
          {popupNode}
        </PopupViewport>
      )}
      {popupNode && sheet && (
        <div
          key={popup}
          data-popup-layer
          className="absolute top-[calc(var(--hx-bar-height)+var(--hx-border-bar)+6px)] right-1.5 bottom-1.5 z-30 animate-[hx-sheet_var(--hx-med)_var(--hx-ease)_both]"
        >
          {popupNode}
        </div>
      )}
      {tip && tipProps && (
        <div
          key={`tip-${tip.id}`}
          className="pointer-events-none absolute top-[calc(var(--hx-bar-height)+var(--hx-border-bar)+6px)] z-30 animate-drop"
          style={anchorStyle(tip.anchor)}
        >
          <Tooltip {...tipProps} />
        </div>
      )}
      {isModal(popup) && (
        <>
          <div className="absolute inset-0 z-29 animate-[hx-fade_.2s_both] bg-[rgba(17,17,27,.5)] backdrop-blur-[4px]" onPointerDown={close} />
          <div
            key={popup}
            data-popup-layer
            className="absolute top-[22%] left-1/2 z-30 animate-pop [transform:translateX(-50%)]"
          >
            {popup === "launcher" ? <Launcher onClose={close} onLaunch={close} /> : <PowerMenu onAction={() => setTimeout(close, 700)} />}
          </div>
        </>
      )}
      {osd && (
        <div
          key={osd.n}
          className="pointer-events-none absolute bottom-24 left-1/2 z-40 -translate-x-1/2 animate-[hx-fade-out_.3s_1.2s_forwards]"
        >
          <Osd kind={osd.kind} value={osd.value} muted={osd.muted} />
        </div>
      )}
      {/* redshift: multiply everything by the black-body colour, darkened by the night brightness. */}
      <div
        data-component="NightLightTint"
        aria-hidden
        className={cx("pointer-events-none absolute inset-0 z-50 mix-blend-multiply", night.fade && "transition-[background-color] duration-1000")}
        style={{ background: night.on ? `rgb(${r * dim} ${g * dim} ${b * dim})` : "white" }}
      />
    </div>
  );
}

interface PopupViewportProps {
  id: Popup;
  anchor: Anchor | null;
  /** Which side the new content slides in from: 1 right, -1 left, 0 first open (drops from the bar). */
  dir: -1 | 0 | 1;
  centred: boolean;
  host: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

/**
 * The one dropdown frame under the bar (shadcn NavigationMenu style): it stays mounted while popups switch,
 * gliding to the new segment and resizing to the new content while that content slides in from the side it came from.
 */
function PopupViewport({ id, anchor, dir, centred, host, children }: PopupViewportProps) {
  const content = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [hostW, setHostW] = useState(0);
  // No transition until the first size has painted, so the first open doesn't grow from 0×0.
  const [settled, setSettled] = useState(false);
  useLayoutEffect(() => {
    const el = content.current;
    if (!el) return;
    const m = () => {
      setSize({ w: el.offsetWidth, h: el.offsetHeight });
      setHostW(host.current?.clientWidth ?? 0);
    };
    m();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(m);
    ro.observe(el);
    return () => ro.disconnect();
  }, [id, host]);
  useEffect(() => {
    if (!size || settled) return;
    const f = requestAnimationFrame(() => requestAnimationFrame(() => setSettled(true)));
    return () => cancelAnimationFrame(f);
  }, [size, settled]);
  const w = size?.w ?? 0;
  const x = centred ? (hostW - w) / 2 : anchor && anchor.left < 400 ? Math.max(6, anchor.left) : hostW - Math.max(6, anchor?.right ?? 6) - w;
  return (
    <div
      data-component="PopupViewport"
      data-popup-layer
      className={cx(
        "absolute top-[calc(var(--hx-bar-height)+var(--hx-border-bar)+6px)] left-0 z-30 overflow-clip [overflow-clip-margin:64px]",
        settled && "transition-[translate,width,height] duration-(--hx-med) ease-hx",
        !size && "invisible",
      )}
      style={{ translate: `${Math.round(x)}px 0`, width: size?.w, height: size?.h }}
    >
      <div
        key={id}
        ref={content}
        className={cx(
          "w-max",
          dir === 1 && "animate-[hx-enter-right_var(--hx-med)_var(--hx-ease)_both]",
          dir === -1 && "animate-[hx-enter-left_var(--hx-med)_var(--hx-ease)_both]",
          dir === 0 && "animate-drop",
        )}
      >
        {children}
      </div>
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

/** Left-align under segments near the left edge, otherwise right-align, keeping 6px off the screen edge. */
const anchorStyle = (a: Anchor | null): CSSProperties => (a && a.left < 400 ? { left: Math.max(6, a.left) } : { right: Math.max(6, a?.right ?? 6) });

/** Hover card for a bar segment, fed from the desktop's live stats; null for segments without one. */
function barTooltip(
  id: Popup,
  { cpu, gpu, mem, net }: SystemStats,
  qs: { volume: number; muted: boolean; brightness: number; night: NightLight },
): TooltipProps | null {
  const pct = (a: number, b: number) => (a / b) * 100;
  switch (id) {
    case "cpu":
      return {
        title: "CPU",
        subtitle: cpu.model,
        icon: "cpu",
        accent: "sky",
        rows: [
          { label: "load", value: `${Math.round(cpu.usage)}%`, bar: cpu.usage },
          { label: "temp", value: `${Math.round(cpu.temp)} °C`, bar: cpu.temp },
          { label: "power", value: cpu.watts == null ? "--" : `${Math.round(cpu.watts)} W` },
          { label: "clock", value: `${(cpu.mhz / 1000).toFixed(2)} GHz`, bar: pct(cpu.mhz, cpu.maxMhz) },
        ],
        hints: [["click", "details"]],
      };
    case "gpu":
      return {
        title: "GPU",
        subtitle: gpu.name,
        icon: "gpu",
        accent: "green",
        rows: [
          { label: "load", value: `${Math.round(gpu.usage)}%`, bar: gpu.usage },
          { label: "temp", value: `${Math.round(gpu.temp)} °C`, bar: gpu.temp },
          { label: "power", value: `${Math.round(gpu.power)} / ${gpu.powerLimit} W`, bar: pct(gpu.power, gpu.powerLimit) },
          { label: "vram", value: `${(gpu.vramUsed / 1024).toFixed(1)} / ${Math.round(gpu.vramTotal / 1024)} GiB`, bar: pct(gpu.vramUsed, gpu.vramTotal) },
          { label: "fan", value: `${Math.round(gpu.fan)}%`, bar: gpu.fan },
        ],
        hints: [["click", "details"]],
      };
    case "mem":
      return {
        title: "Memory",
        subtitle: `DDR5 · ${bytes(mem.total)}`,
        icon: "memory",
        accent: "mauve",
        rows: [
          { label: "ram", value: bytes(mem.used), bar: pct(mem.used, mem.total) },
          { label: "cached", value: bytes(mem.cached), bar: pct(mem.cached, mem.total) },
          { label: "swap", value: bytes(mem.swapUsed), bar: pct(mem.swapUsed, mem.swapTotal) },
        ],
        hints: [["click", "details"]],
      };
    case "net":
      return {
        title: "Ethernet",
        subtitle: `${net.iface} · ${net.ip}`,
        icon: "ethernet",
        accent: "sapphire",
        rows: [
          { label: "down", value: rate(net.rx) },
          { label: "up", value: rate(net.tx) },
          { label: "session", value: `${bytes(net.rxTotal)} ↓ ${bytes(net.txTotal)} ↑` },
        ],
        hints: [["click", "details"]],
      };
    case "qs":
      return {
        title: "Quick settings",
        subtitle: "Wi-Fi · Bluetooth · Night light · Sound",
        icon: "settings",
        accent: "lavender",
        rows: [
          { label: "volume", value: qs.muted ? "muted" : `${qs.volume}%`, bar: qs.muted ? 0 : qs.volume },
          { label: "brightness", value: `${qs.brightness}%`, bar: qs.brightness },
          { label: "night light", value: qs.night.on ? `${qs.night.temp} K` : "off" },
        ],
        hints: [
          ["click", "open"],
          ["scroll", "volume"],
        ],
      };
    default:
      return null;
  }
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
