import { Icon, type Accent, type IconName } from "../ui";
import "./shell.css";

export type OsdKind = "volume" | "brightness" | "mic" | "capslock" | "layout" | "keyboard-light";

export interface OsdProps {
  kind?: OsdKind;
  /** 0-100 for the level kinds. */
  value?: number;
  muted?: boolean;
  /** On/off for capslock; layout name for `layout`. */
  label?: string;
  /** Segment count of the level bar. */
  cells?: number;
  className?: string;
}

const KINDS: Record<OsdKind, { icon: (v: number, muted: boolean) => IconName; accent: Accent; level: boolean }> = {
  volume: {
    icon: (v, m) => (m || v === 0 ? "volumeOff" : v < 34 ? "volumeLow" : v < 67 ? "volumeMedium" : "volumeHigh"),
    accent: "yellow",
    level: true,
  },
  brightness: { icon: (v) => (v < 40 ? "moon" : "sun"), accent: "peach", level: true },
  mic: { icon: (_, m) => (m ? "micOff" : "mic"), accent: "pink", level: true },
  "keyboard-light": { icon: () => "keyboard", accent: "lavender", level: true },
  capslock: { icon: () => "keyboard", accent: "sky", level: false },
  layout: { icon: () => "keyboard", accent: "blue", level: false },
};

/** swayosd-style on-screen display for volume, brightness, mic, caps lock and layout changes. */
export function Osd({ kind = "volume", value = 64, muted = false, label, cells = 20, className }: OsdProps) {
  const k = KINDS[kind];
  const lit = Math.round((Math.max(0, Math.min(100, value)) / 100) * cells);
  const accent = muted ? "overlay1" : k.accent;
  return (
    <div
      className={["rx-osd", muted && "is-muted", className].filter(Boolean).join(" ")}
      style={{ ["--hx-acc" as string]: `var(--hx-${accent})` }}
      role="status"
    >
      <Icon name={k.icon(value, muted)} size={22} className="rx-osd-icon" />
      {k.level ? (
        <>
          <div className="rx-osd-cells" aria-hidden>
            {Array.from({ length: cells }, (_, i) => (
              <i key={i} className={i < lit ? "is-on" : undefined} />
            ))}
          </div>
          <span className="rx-osd-val">{muted ? "mute" : `${value}`}</span>
        </>
      ) : (
        <span className="rx-osd-text">
          {kind === "capslock" ? `caps lock ${label ?? "on"}` : (label ?? "us")}
        </span>
      )}
    </div>
  );
}
