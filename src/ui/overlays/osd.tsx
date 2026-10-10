import { Icon } from "../foundations/icon";
import { type IconName } from "../icons";
import { cx, type Accent } from "../lib";

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
      data-component="Osd"
      className={cx(
        "kit-type inline-flex h-[52px] min-w-[340px] animate-[hx-pop-up_.22s_var(--hx-ease-overshot)_both] items-center gap-3.5 pr-[18px] pl-4",
        "border-l-3 border-acc bg-mantle/94 text-text shadow-popup ring ring-surface0",
        className,
      )}
      style={{ ["--hx-acc" as string]: `var(--hx-${accent})` }}
      role="status"
    >
      <Icon name={k.icon(value, muted)} size={22} className="text-acc" />
      {k.level ? (
        <>
          <div className="grid h-2.5 flex-1 auto-cols-fr grid-flow-col gap-0.5" aria-hidden>
            {Array.from({ length: cells }, (_, i) => (
              <i key={i} className={i < lit ? "bg-acc" : "bg-surface0"} />
            ))}
          </div>
          <span className={cx("w-[3.2ch] text-right", muted ? "text-[12px] font-normal text-overlay1" : "text-[14px] font-bold")}>
            {muted ? "mute" : `${value}`}
          </span>
        </>
      ) : (
        <span className="text-[14px] font-bold tracking-[.04em]">
          {kind === "capslock" ? `caps lock ${label ?? "on"}` : (label ?? "us")}
        </span>
      )}
    </div>
  );
}
