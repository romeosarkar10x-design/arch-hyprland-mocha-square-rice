import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Bar } from "../bar/Bar";
import { BarSegment } from "../bar/BarSegment";
import { Workspaces } from "../bar/Workspaces";
import { Visualizer } from "../data/Visualizer";
import { BrowserView } from "./BrowserView";
import { CodeView } from "./CodeView";
import { Terminal } from "./Terminal";
import { Wallpaper } from "./Wallpaper";
import { WindowFrame } from "./WindowFrame";
import { Icon } from "../foundations/Icon";
import type { IconName } from "../icons";
import { Unit } from "../foundations/Unit";
import { cx, level, rate, useInterval } from "../lib";
import { Launcher } from "../overlays/Launcher";
import { PowerMenu } from "../overlays/PowerMenu";
import { Toast, type ToastProps } from "../overlays/Toast";
import { ToastStack } from "../overlays/ToastStack";
import { AudioPanel } from "../popups/AudioPanel";
import { ClockPanel } from "../popups/ClockPanel";
import { CpuPanel } from "../popups/CpuPanel";
import { GpuPanel } from "../popups/GpuPanel";
import { MediaPlayer, demoTrack } from "../popups/MediaPlayer";
import { MemoryPanel } from "../popups/MemoryPanel";
import { NetworkPanel } from "../popups/NetworkPanel";
import { QuickSettings } from "../popups/QuickSettings";
import { useSystemStats } from "../stats";

export type Popup = "clock" | "cpu" | "gpu" | "power" | "launcher" | "media" | "mem" | "net" | "audio" | "qs";

/** x, y, width, height as fractions of the stage. */
type Box = [number, number, number, number];

interface Win {
  id: string;
  app: IconName;
  tag: string;
  box: Box;
  body: ReactNode;
}

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
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  const [clock, setClock] = useState(() => new Date());
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
  useEffect(() => {
    if (!notifications) return;
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
  }, [notifications]);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  const layouts: Record<number, Win[]> = {
    1: [
      { id: "code", app: "code", tag: "nvim", box: [0, 0, 0.58, 1], body: <CodeView /> },
      { id: "term", app: "ghostty", tag: "ghostty", box: [0.58, 0, 0.42, 0.62], body: <Terminal /> },
      {
        id: "cava",
        app: "music",
        tag: "cava",
        box: [0.58, 0.62, 0.42, 0.38],
        body: (
          <div className="hx-win-pad">
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
          <div className="hx-win-media">
            <MediaPlayer track={demoTrack} position={97} />
            <Visualizer height={180} variant="mirror" from="green" to="teal" playing={!paused} />
          </div>
        ),
      },
    ],
  };
  const wsList = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, apps: (layouts[i + 1] ?? []).map((w) => w.app) }));
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
  const c = stats.cpu,
    g = stats.gpu,
    m = stats.mem,
    n = stats.net;
  const memPct = (m.used / m.total) * 100;
  const cpuLv = c.usage >= 90 || c.temp >= 85 ? "crit" : c.usage >= 60 || c.temp >= 75 ? "warn" : "ok";
  const gpuLv = g.usage >= 90 || g.temp >= 85 ? "crit" : g.usage >= 60 || g.temp >= 75 ? "warn" : "ok";
  const ref = (id: Popup) => (el: HTMLButtonElement | null) => {
    segs.current[id] = el;
  };
  const popupNode = (() => {
    switch (popup) {
      case "cpu":
        return <CpuPanel data={c} />;
      case "gpu":
        return <GpuPanel data={g} />;
      case "mem":
        return <MemoryPanel data={m} />;
      case "net":
        return <NetworkPanel data={n} />;
      case "audio":
        return <AudioPanel />;
      case "clock":
        return <ClockPanel />;
      case "qs":
        return <QuickSettings />;
      case "media":
        return (
          <div className="hx-popcard">
            <MediaPlayer track={demoTrack} position={97} />
          </div>
        );
      default:
        return null;
    }
  })();
  const centred = popup === "clock" || popup === "media";
  return (
    <div
      ref={root}
      className={cx("hx-desk", className)}
      style={{ width, height }}
      tabIndex={0}
      onPointerDown={(e) => {
        if (e.target === root.current) root.current?.focus();
      }}
    >
      <Wallpaper variant={wallpaper} />
      <Bar
        left={
          <>
            <BarSegment
              ref={ref("launcher")}
              variant="launcher"
              icon="arch"
              label="Launcher"
              open={popup === "launcher"}
              onClick={() => open("launcher")}
            />
            <Workspaces
              workspaces={wsList}
              active={ws}
              onSelect={(id) => {
                setWs(id);
                setPopup(null);
              }}
            />
            <BarSegment variant="title" accent="lavender">
              {titleFor(layouts[ws], focus[ws])}
            </BarSegment>
          </>
        }
        center={
          <>
            <BarSegment ref={ref("media")} variant="media" icon="spotify" accent="green" open={popup === "media"} onClick={() => open("media")}>
              {demoTrack.artist}
              {" — "}
              {demoTrack.title}
            </BarSegment>
            <BarSegment ref={ref("clock")} variant="clock" icon="clock" open={popup === "clock"} onClick={() => open("clock")}>
              {clock.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
              {"  "}
              {String(clock.getHours() % 12 || 12).padStart(2, "0")}:{String(clock.getMinutes()).padStart(2, "0")}{" "}
              <Unit>{clock.getHours() < 12 ? "AM" : "PM"}</Unit>
            </BarSegment>
          </>
        }
        right={
          <>
            <BarSegment ref={ref("net")} icon="ethernet" accent="sapphire" open={popup === "net"} onClick={() => open("net")}>
              <Icon name="down" />
              {rate(n.rx).replace("/s", "")} <Icon name="up" />
              {rate(n.tx).replace("/s", "")}
            </BarSegment>
            <BarSegment
              ref={ref("cpu")}
              icon="cpu"
              accent="sky"
              divider
              level={cpuLv}
              spark={c.history}
              open={popup === "cpu"}
              onClick={() => open("cpu")}
            >
              {Math.round(c.usage)}
              {"% "}
              {Math.round(c.temp)}
              {"° "}
              {c.watts == null ? "--" : Math.round(c.watts)}
              <Unit>W</Unit>
            </BarSegment>
            <BarSegment
              ref={ref("gpu")}
              icon="gpu"
              accent="green"
              divider
              level={gpuLv}
              spark={g.history}
              open={popup === "gpu"}
              onClick={() => open("gpu")}
            >
              {Math.round(g.usage)}
              {"% "}
              {Math.round(g.temp)}
              {"° "}
              {Math.round(g.power)}
              <Unit>W</Unit>
            </BarSegment>
            <BarSegment
              ref={ref("mem")}
              icon="memory"
              accent="mauve"
              divider
              level={level(memPct, 75, 90)}
              open={popup === "mem"}
              onClick={() => open("mem")}
            >
              {Math.round(memPct)}%
            </BarSegment>
            <BarSegment ref={ref("audio")} icon="volumeMedium" accent="yellow" divider open={popup === "audio"} onClick={() => open("audio")}>
              64%
            </BarSegment>
            <BarSegment
              icon={caffeine ? "coffee" : "coffeeOff"}
              accent={caffeine ? "yellow" : "text"}
              divider
              dim={!caffeine}
              className={caffeine ? "is-caffeine" : undefined}
              onClick={() => setCaffeine(!caffeine)}
              label="Caffeine"
            />
            <BarSegment ref={ref("qs")} divider open={popup === "qs"} onClick={() => open("qs")} label="Tray and quick settings" className="hx-tray">
              <Icon name="chat" /> <Icon name="steam" /> <Icon name="bluetooth" />
            </BarSegment>
            <BarSegment ref={ref("power")} variant="power" icon="power" label="Power" open={popup === "power"} onClick={() => open("power")} />
          </>
        }
      />
      <div className="hx-stage">
        {Object.entries(layouts).map(([k, wins]) => {
          const id = Number(k);
          return (
            <div key={k} className="hx-wsview" style={{ transform: `translateX(${(id - ws) * 100}%)` }} aria-hidden={id !== ws}>
              {wins.map((w) => (
                <WindowFrame
                  key={w.id}
                  focused={focus[id] === w.id}
                  tag={w.tag}
                  onFocus={() => setFocus({ ...focus, [id]: w.id })}
                  style={place(w.box)}
                >
                  {w.body}
                </WindowFrame>
              ))}
            </div>
          );
        })}
        {!layouts[ws] && (
          <div className="hx-empty-ws">
            <span className="hx-caps">
              {"workspace "}
              {ws}
            </span>
            <span className="hx-faint">
              {"empty · press "}
              <kbd className="hx-kbd">/</kbd>
              {" to launch something"}
            </span>
          </div>
        )}
      </div>
      {popup && <div className={cx("hx-scrim", (popup === "launcher" || popup === "power") && "is-dark")} onPointerDown={() => setPopup(null)} />}
      {popupNode && (
        <div
          key={popup}
          className="hx-layer"
          style={
            centred
              ? { left: "50%", transform: "translateX(-50%)" }
              : anchor && anchor.left < 400
                ? { left: Math.max(6, anchor.left) }
                : { right: Math.max(6, anchor?.right ?? 6) }
          }
        >
          {popupNode}
        </div>
      )}
      {popup === "launcher" && (
        <div key="launcher" className="hx-layer hx-layer--center">
          <Launcher onClose={() => setPopup(null)} onLaunch={() => setPopup(null)} />
        </div>
      )}
      {popup === "power" && (
        <div key="power" className="hx-layer hx-layer--center">
          <PowerMenu onAction={() => setTimeout(() => setPopup(null), 700)} />
        </div>
      )}
      <ToastStack>
        {toasts.map(({ id, ...t }) => (
          <Toast key={id} {...t} onClose={() => dismiss(id)} />
        ))}
      </ToastStack>
    </div>
  );
}

function titleFor(wins: Win[] | undefined, focused: string | undefined) {
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

function place([x, y, w, h]: Box) {
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
