import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../controls/button";
import { IconButton } from "../controls/icon-button";
import { Slider } from "../controls/slider";
import { Toggle } from "../controls/toggle";
import { KeyValueList } from "../data/key-value-list";
import { Icon } from "../foundations/icon";
import { accentVar, cx, kelvinRgb, useControllable, type Accent } from "../lib";
import { demoOutputs, AudioDeviceList } from "./audio-panel";
import { BluetoothDevices, demoDevices, toggleDevice } from "./bluetooth-menu";
import { Panel } from "./panel";
import { PanelSection } from "./panel-section";
import { WifiNetworks, demoNetworks } from "./wifi-menu";
import type { IconName } from "../icons";

/** The detail pages behind the tiles (and the volume slider). */
export type QuickPage = "main" | "wifi" | "bluetooth" | "night" | "audio";

export const defaultTiles: QuickTile[] = [
  { id: "wifi", icon: "wifi", label: "Wi-Fi", on: true, accent: "sapphire", page: "wifi" },
  { id: "bluetooth", icon: "bluetooth", label: "Bluetooth", on: true, accent: "blue", page: "bluetooth" },
  { id: "night", icon: "moon", label: "Night light", accent: "peach", page: "night" },
  { id: "caffeine", icon: "coffee", label: "Caffeine", detail: "idle allowed", accent: "yellow" },
  { id: "dnd", icon: "bellOff", label: "Do not disturb", detail: "off", accent: "red" },
  { id: "game", icon: "gamepad", label: "Game mode", detail: "blur + anim off", accent: "green" },
];

export interface QuickTile {
  id: string;
  icon: IconName;
  label: string;
  /** Status line; "off" / "idle allowed" flip to "on" when toggled. Wi-Fi, Bluetooth and Night light fill theirs in live. */
  detail?: string;
  /** Initial state. */
  on?: boolean;
  accent?: Accent;
  /** Detail page opened by the tile's chevron, a long press or a right click. */
  page?: QuickPage;
}

/** redshift settings. */
export interface NightLight {
  on: boolean;
  /** Colour temperature in K, 1000-6500 (redshift -O / -t). */
  temp: number;
  /** Screen brightness while shifted, 10-100 % (redshift -b). */
  brightness: number;
  /** manual: on until turned off; sun: sunset to sunrise from the location; custom: `from`-`to`. */
  schedule: "manual" | "sun" | "custom";
  /** HH:MM, for the custom schedule. */
  from: string;
  to: string;
  /** Fade in and out over a few seconds instead of snapping (redshift -r turns this off). */
  fade: boolean;
}

export const defaultNightLight: NightLight = { on: false, temp: 4200, brightness: 100, schedule: "sun", from: "20:00", to: "07:00", fade: true };

export interface QuickSettingsProps {
  tiles?: QuickTile[];
  /** Columns in the tile grid. */
  columns?: number;
  onToggle?: (id: string, on: boolean) => void;
  /** Render just the grid (no Panel chrome, sliders or pages). */
  bare?: boolean;
  /** Page shown first. */
  page?: QuickPage;
  /** Output volume 0-100. Controlled when given. */
  volume?: number;
  muted?: boolean;
  onVolumeChange?: (v: number) => void;
  onMutedChange?: (muted: boolean) => void;
  /** Backlight 0-100. Controlled when given. */
  brightness?: number;
  onBrightnessChange?: (v: number) => void;
  /** Controlled when given; the Night light tile and page both drive it. */
  nightLight?: NightLight;
  onNightLightChange?: (n: NightLight) => void;
  className?: string;
}

/**
 * Android-style control centre behind the bar's settings icon: brightness and volume sliders over a grid of toggle tiles.
 * A tile's chevron, a long press or a right click opens its page (Wi-Fi networks, Bluetooth devices, Night light, Sound).
 */
export function QuickSettings({
  tiles = defaultTiles,
  columns = 3,
  onToggle,
  bare,
  page: firstPage = "main",
  volume,
  muted,
  onVolumeChange,
  onMutedChange,
  brightness,
  onBrightnessChange,
  nightLight,
  onNightLightChange,
  className,
}: QuickSettingsProps) {
  const [state, setState] = useState(() => Object.fromEntries(tiles.map((t) => [t.id, !!t.on])));
  const [page, setPage] = useState(firstPage);
  const [vol, setVol] = useControllable(volume, 64, onVolumeChange);
  const [mute, setMute] = useControllable(muted, false, onMutedChange);
  const [light, setLight] = useControllable(brightness, 72, onBrightnessChange);
  const [night, setNight] = useControllable(nightLight, defaultNightLight, onNightLightChange);
  const [ssid, setSsid] = useState<string | null>("home-5G");
  const [devices, setDevices] = useState(demoDevices);
  const [output, setOutput] = useState(demoOutputs[0]!.id);
  const [mic, setMic] = useState(80);
  const [micMute, setMicMute] = useState(false);

  const isOn = (id: string) => (id === "night" ? night.on : !!state[id]);
  const set = (id: string, on: boolean) => {
    if (id === "night") setNight({ ...night, on });
    else setState({ ...state, [id]: on });
    onToggle?.(id, on);
  };
  const connectedDevices = devices.filter((d) => d.connected);
  const live: Record<string, string> = {
    wifi: ssid ?? "not connected",
    bluetooth: connectedDevices.length === 0 ? "no devices" : connectedDevices.length === 1 ? connectedDevices[0]!.name : `${connectedDevices.length} devices`,
    night: `${night.temp} K`,
  };
  const volIcon = mute || vol === 0 ? "volumeOff" : vol < 34 ? "volumeLow" : vol < 67 ? "volumeMedium" : "volumeHigh";
  const back = () => setPage("main");

  const grid = (
    <div
      data-component="QuickSettingsGrid"
      className={cx("kit-type grid gap-px bg-surface0 text-text", bare && className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {tiles.map((t) => (
        <QuickTileButton
          key={t.id}
          tile={t}
          on={isOn(t.id)}
          detail={live[t.id]}
          onClick={() => set(t.id, !isOn(t.id))}
          onOpen={!bare && t.page ? () => setPage(t.page!) : undefined}
        />
      ))}
    </div>
  );
  if (bare) return grid;

  const volumeSlider = (
    <Slider
      label="Volume"
      icon={volIcon}
      value={vol}
      muted={mute}
      onChange={setVol}
      onIconClick={() => setMute(!mute)}
      format={(v) => (mute ? "mute" : `${Math.round(v)}%`)}
      accent="yellow"
      ticks={0}
      className="flex-1"
    />
  );

  switch (page) {
    case "wifi":
      return (
        <SubPage
          title="Wi-Fi"
          accent="sapphire"
          subtitle={isOn("wifi") ? (ssid ? `connected · ${ssid}` : "not connected") : "radio off"}
          on={isOn("wifi")}
          onOnChange={(on) => set("wifi", on)}
          onBack={back}
          className={className}
          actions={
            <>
              <Button size="sm" variant="ghost" icon="plus">
                Hidden network
              </Button>
              <span className="flex-1" />
              <Button size="sm" variant="ghost" icon="settings" accent="sapphire">
                nmtui
              </Button>
            </>
          }
        >
          {isOn("wifi") ? (
            <WifiNetworks networks={demoNetworks} connected={ssid} onConnect={setSsid} onDisconnect={() => setSsid(null)} />
          ) : (
            <OffNote>Wi-Fi is off</OffNote>
          )}
        </SubPage>
      );
    case "bluetooth":
      return (
        <SubPage
          title="Bluetooth"
          accent="blue"
          subtitle={isOn("bluetooth") ? `${connectedDevices.length} connected · discoverable` : "off"}
          on={isOn("bluetooth")}
          onOnChange={(on) => set("bluetooth", on)}
          onBack={back}
          className={className}
          actions={
            <>
              <IconButton icon="reboot" label="Rescan" size="sm" />
              <span className="flex-1" />
              <Button size="sm" variant="ghost" icon="settings" accent="blue">
                blueman
              </Button>
            </>
          }
        >
          {isOn("bluetooth") ? (
            <BluetoothDevices devices={devices} onToggle={(name) => setDevices((xs) => toggleDevice(xs, name))} />
          ) : (
            <OffNote>Bluetooth is off</OffNote>
          )}
        </SubPage>
      );
    case "night":
      return <NightLightPage value={night} onChange={setNight} onBack={back} className={className} />;
    case "audio":
      return (
        <SubPage
          title="Sound"
          accent="yellow"
          subtitle={`PipeWire 1.4 · ${demoOutputs.find((o) => o.id === output)?.name ?? "no output"}`}
          onBack={back}
          className={className}
          actions={
            <>
              <Button size="sm" variant="ghost" icon="settings" accent="yellow">
                pavucontrol
              </Button>
              <span className="flex-1" />
              <span className="text-[11px] text-overlay1">scroll on bar ±2%</span>
            </>
          }
        >
          <PanelSection label="output">{volumeSlider}</PanelSection>
          <PanelSection label="devices">
            <AudioDeviceList devices={demoOutputs} selected={output} onSelect={setOutput} />
          </PanelSection>
          <PanelSection label="microphone">
            <Slider
              label="Mic volume"
              icon={micMute ? "micOff" : "mic"}
              value={mic}
              muted={micMute}
              accent="peach"
              onChange={setMic}
              onIconClick={() => setMicMute(!micMute)}
              ticks={0}
            />
          </PanelSection>
        </SubPage>
      );
  }

  return (
    <Panel
      data-component="QuickSettings"
      className={className}
      width={400}
      icon="settings"
      accent="lavender"
      title="Quick settings"
      subtitle="romeo@archlinux · up 3h 12m"
      actions={<span className="text-[11px] text-overlay1">hold a tile, or press ›, for more</span>}
    >
      <PanelSection>
        <Slider label="Brightness" icon={light < 40 ? "moon" : "sun"} value={light} onChange={setLight} accent="peach" ticks={0} className="pr-[30px]" />
        <div className="flex items-center gap-1">
          {volumeSlider}
          <IconButton icon="chevronRight" label="Sound settings" size="sm" onClick={() => setPage("audio")} />
        </div>
      </PanelSection>
      <PanelSection flush>{grid}</PanelSection>
    </Panel>
  );
}

interface SubPageProps {
  title: string;
  subtitle?: ReactNode;
  accent: Accent;
  /** Master switch in the header; omit for pages without one. */
  on?: boolean;
  onOnChange?: (on: boolean) => void;
  onBack: () => void;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** A detail page: same Panel, with a back button in place of the icon tile and the feature's master switch on the right. */
function SubPage({ title, subtitle, accent, on, onOnChange, onBack, actions, children, className }: SubPageProps) {
  return (
    <Panel
      data-component="QuickSettingsPage"
      className={cx("[&>*:not(header):not([data-component=Corners])]:animate-slide", className)}
      width={400}
      accent={accent}
      title={
        <span className="-my-1 -ml-1.5 flex items-center gap-1.5">
          <IconButton icon="chevronLeft" label="Back" size="sm" onClick={onBack} />
          {title}
        </span>
      }
      subtitle={<span className="ml-[26px]">{subtitle}</span>}
      headerAside={on != null && <Toggle checked={on} onChange={onOnChange} accent={accent} />}
      actions={actions}
    >
      {children}
    </Panel>
  );
}

function OffNote({ children }: { children: ReactNode }) {
  return (
    <PanelSection>
      <span className="py-6 text-center text-overlay1">{children}</span>
    </PanelSection>
  );
}

const PRESETS: [string, number][] = [
  ["candle", 1900],
  ["warm", 3400],
  ["soft", 4500],
  ["mild", 5500],
];

const SCHEDULES: [NightLight["schedule"], string][] = [
  ["manual", "manual"],
  ["sun", "at sunset"],
  ["custom", "custom"],
];

/** Night light (redshift) page: temperature with presets, dimming, schedule and fade. */
function NightLightPage({ value: n, onChange, onBack, className }: { value: NightLight; onChange: (n: NightLight) => void; onBack: () => void; className?: string }) {
  const set = (patch: Partial<NightLight>) => onChange({ ...n, ...patch });
  const [r, g, b] = kelvinRgb(n.temp);
  return (
    <SubPage
      title="Night light"
      accent="peach"
      subtitle={`redshift · ${n.on ? `${n.temp} K` : "off"} · ${SCHEDULES.find(([s]) => s === n.schedule)![1]}`}
      on={n.on}
      onOnChange={(on) => set({ on })}
      onBack={onBack}
      className={className}
      actions={
        <>
          <Button size="sm" variant="ghost" icon="settings" accent="peach">
            redshift.conf
          </Button>
          <span className="flex-1" />
          <Button size="sm" variant="ghost" onClick={() => onChange({ ...defaultNightLight, on: n.on })}>
            Reset
          </Button>
        </>
      }
    >
      <PanelSection
        label="colour temperature"
        aside={
          <span className="inline-flex items-center gap-1.5 text-peach">
            <i className="size-2.5 ring ring-surface1" style={{ background: `rgb(${r} ${g} ${b})` }} />
            {n.temp} K
          </span>
        }
      >
        <Slider
          label="Colour temperature"
          value={n.temp - 1000}
          max={5500}
          step={100}
          onChange={(v) => set({ temp: v + 1000 })}
          accent="peach"
          showValue={false}
          ticks={12}
        />
        <div className="flex justify-between text-[10.5px] text-overlay1">
          <span>warmer · more shift</span>
          <span>6500 K · none</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {PRESETS.map(([name, k]) => (
            <Button key={name} size="sm" variant={n.temp === k ? "primary" : "secondary"} accent="peach" onClick={() => set({ temp: k })}>
              {name}
            </Button>
          ))}
        </div>
      </PanelSection>
      <PanelSection label="dim screen" aside={<span className="text-peach">{n.brightness}%</span>}>
        <Slider
          label="Night brightness"
          icon="sun"
          value={n.brightness - 10}
          max={90}
          step={5}
          onChange={(v) => set({ brightness: v + 10 })}
          accent="peach"
          showValue={false}
          ticks={0}
        />
      </PanelSection>
      <PanelSection label="schedule">
        <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="Schedule">
          {SCHEDULES.map(([s, label]) => (
            <Button key={s} role="radio" aria-checked={n.schedule === s} size="sm" variant={n.schedule === s ? "primary" : "secondary"} accent="peach" onClick={() => set({ schedule: s })}>
              {label}
            </Button>
          ))}
        </div>
        {n.schedule === "manual" && <span className="text-[11px] text-overlay1">Stays as set until you turn it off.</span>}
        {n.schedule === "sun" && (
          <KeyValueList>
            <dt>location</dt>
            <dd>22.57° N · 88.36° E</dd>
            <dt>sunset</dt>
            <dd>17:21 · fully warm 17:51</dd>
            <dt>sunrise</dt>
            <dd>05:39</dd>
          </KeyValueList>
        )}
        {n.schedule === "custom" && (
          <div className="flex items-center gap-2 text-[12px]">
            <TimeInput label="From" value={n.from} onChange={(from) => set({ from })} />
            <Icon name="chevronRight" className="text-overlay1" />
            <TimeInput label="To" value={n.to} onChange={(to) => set({ to })} />
          </div>
        )}
        <Toggle label="Smooth transitions" description="fade in and out instead of snapping" checked={n.fade} onChange={(fade) => set({ fade })} accent="peach" />
      </PanelSection>
    </SubPage>
  );
}

function TimeInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-1 items-center gap-2">
      <span className="text-subtext0">{label}</span>
      <input
        type="time"
        className="uninput h-[26px] flex-1 bg-crust px-2 text-[12px] [color-scheme:dark] inset-ring inset-ring-surface1 focus:inset-ring-peach"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

const HOLD_MS = 450;

interface QuickTileButtonProps {
  tile: QuickTile;
  on: boolean;
  /** Live status line, shown while on (e.g. the connected SSID). */
  detail?: string;
  onClick: () => void;
  /** Opens the tile's page; adds the chevron and the long-press / right-click gestures. */
  onOpen?: () => void;
}

/** One toggle tile; floods with its accent when on. Tiles with a page split off a chevron and open it on a long press. */
function QuickTileButton({ tile: t, on, detail, onClick, onOpen }: QuickTileButtonProps) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const held = useRef(false);
  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  // "off" / "idle allowed" describe the off state, so they read "on" when toggled; any other detail describes the on state.
  const offDetail = t.detail === "off" || t.detail === "idle allowed";
  const status = detail != null ? (on ? detail : "off") : on ? (offDetail ? "on" : t.detail) : offDetail ? t.detail : "off";
  return (
    <div
      data-component="QuickTileButton"
      className={cx(
        "relative flex min-h-[84px] bg-mantle text-text transition-[background-color,color] duration-(--hx-med) hover:bg-base",
        on && "bg-acc text-crust hover:bg-[color-mix(in_srgb,var(--hx-acc)_85%,white)]",
      )}
      style={{ ["--hx-acc" as string]: accentVar(t.accent) }}
    >
      <button
        type="button"
        aria-pressed={on}
        className={cx("unbutton flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 bg-transparent p-3 text-left text-inherit", onOpen && "pr-0")}
        onClick={() => {
          if (held.current) held.current = false;
          else onClick();
        }}
        onPointerDown={
          onOpen &&
          ((e) => {
            if (e.button !== 0) return;
            held.current = false;
            setHolding(true);
            timer.current = setTimeout(() => {
              held.current = true;
              setHolding(false);
              onOpen();
            }, HOLD_MS);
          })
        }
        onPointerUp={onOpen && cancel}
        onPointerLeave={onOpen && cancel}
        onContextMenu={
          onOpen &&
          ((e) => {
            e.preventDefault();
            onOpen();
          })
        }
      >
        <Icon name={t.icon} className={cx("mb-auto text-[20px] transition-colors duration-(--hx-med)", on ? "text-crust" : "text-acc")} />
        <span className="mt-2.5 truncate text-[12px] font-bold">{t.label}</span>
        <span className={cx("truncate text-[10.5px]", on ? "text-crust opacity-70" : "text-overlay1")}>{status}</span>
      </button>
      {onOpen && (
        <button
          type="button"
          aria-label={`${t.label} settings`}
          className={cx(
            "unbutton grid w-6 flex-none cursor-pointer place-items-center bg-transparent text-[16px] transition-[background-color]",
            on ? "text-crust/70 hover:bg-crust/12 hover:text-crust" : "text-overlay1 hover:bg-surface0 hover:text-text",
          )}
          onClick={onOpen}
        >
          <Icon name="chevronRight" />
        </button>
      )}
      {holding && <i className="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-[hx-grow_.45s_linear_both] bg-current" />}
    </div>
  );
}
