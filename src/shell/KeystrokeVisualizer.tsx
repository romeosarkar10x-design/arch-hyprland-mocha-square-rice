import { useEffect, useState, type CSSProperties } from "react";
import { Icon, Kbd } from "../ds";
import "./shell.css";

export interface Stroke {
  id: number;
  /** One combo, e.g. ["SUPER", "SHIFT", "H"]. */
  keys: string[];
  /** Times it was pressed in a row. */
  count: number;
  at: number;
}

const MODS: Record<string, string> = { Meta: "SUPER", OS: "SUPER", Control: "CTRL", Alt: "ALT", Shift: "SHIFT", AltGraph: "ALTGR" };
const NAMED: Record<string, string> = {
  " ": "SPACE", Enter: "RETURN", Escape: "ESC", Backspace: "⌫", Delete: "DEL", Tab: "TAB", CapsLock: "CAPS",
  ArrowLeft: "←", ArrowRight: "→", ArrowUp: "↑", ArrowDown: "↓", PageUp: "PGUP", PageDown: "PGDN", PrintScreen: "PRINT",
  AudioVolumeUp: "VOL+", AudioVolumeDown: "VOL−", AudioVolumeMute: "MUTE", MediaPlayPause: "⏯", MediaTrackNext: "⏭", MediaTrackPrevious: "⏮",
};

/** The key a press names, Hyprland-style: layout-independent letters / digits, symbolic names for the rest. */
export function keyName(e: { key: string; code: string }): string {
  if (/^Key[A-Z]$/.test(e.code)) return e.code.slice(3);
  if (/^Digit\d$/.test(e.code)) return e.code.slice(5);
  return NAMED[e.key] ?? (e.key.length === 1 ? e.key.toUpperCase() : e.key.toUpperCase());
}

/** The combo for a keydown, or null for a bare modifier press. */
export function comboFromEvent(e: { key: string; code: string; metaKey: boolean; ctrlKey: boolean; altKey: boolean; shiftKey: boolean }): string[] | null {
  if (MODS[e.key]) return null;
  const keys: string[] = [];
  if (e.metaKey) keys.push("SUPER");
  if (e.ctrlKey) keys.push("CTRL");
  if (e.altKey) keys.push("ALT");
  // Shift on a printable symbol is already in the symbol (! not SHIFT + 1), except letters / digits.
  if (e.shiftKey && (e.key.length > 1 || /^(Key|Digit)/.test(e.code))) keys.push("SHIFT");
  keys.push(keyName(e));
  return keys;
}

/** Add a combo to a stroke list: a repeat of the last one within `window` ms bumps its count. */
export function pushStroke(list: Stroke[], keys: string[], at: number, max = 6, window = 1200): Stroke[] {
  const last = list.at(-1);
  if (last && last.keys.join("+") === keys.join("+") && at - last.at < window) {
    return [...list.slice(0, -1), { ...last, count: last.count + 1, at }];
  }
  return [...list, { id: (last?.id ?? 0) + 1, keys, count: 1, at }].slice(-max);
}

/** Record keystrokes typed anywhere on the page (like wshowkeys / showmethekey do system-wide). */
export function useKeystrokes(enabled = true, max = 6): Stroke[] {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const keys = comboFromEvent(e);
      if (keys) setStrokes((s) => pushStroke(s, keys, e.timeStamp, max));
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [enabled, max]);
  return strokes;
}

export interface KeystrokeVisualizerProps {
  strokes: Stroke[];
  /** How long a combo stays before fading, ms. */
  linger?: number;
  /** `stack`: one combo per line (showmethekey). `line`: a running strip (wshowkeys). */
  layout?: "stack" | "line";
  /** Show the title bar. */
  titled?: boolean;
  /** Text shown when nothing has been pressed yet. */
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}

/** A small on-screen window showing the keys being pressed, for screencasts and demos. */
export function KeystrokeVisualizer({ strokes, linger = 2400, layout = "stack", titled = true, placeholder = "press some keys…", className, style }: KeystrokeVisualizerProps) {
  return (
    <div className={["rx-ksv", `rx-ksv--${layout}`, className].filter(Boolean).join(" ")} style={{ "--rx-ksv-linger": `${linger}ms`, ...style } as CSSProperties} aria-live="polite">
      {titled && (
        <header className="rx-ksv-head">
          <Icon name="keyboard" size={12} /> keys
        </header>
      )}
      <div className="rx-ksv-list">
        {strokes.length === 0 && <span className="rx-ksv-none hx-faint">{placeholder}</span>}
        {strokes.map((s) => (
          <span key={`${s.id}:${s.count}`} className="rx-ksv-combo">
            {s.keys.map((k, i) => (
              <span key={i} className="rx-ksv-key">
                {i > 0 && <i>+</i>}
                <Kbd>{k}</Kbd>
              </span>
            ))}
            {s.count > 1 && <b className="rx-ksv-count">×{s.count}</b>}
          </span>
        ))}
      </div>
    </div>
  );
}
