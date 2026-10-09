import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon, Wallpaper } from "../ds";
import "./shell.css";

export interface LockScreenProps {
  user?: string;
  /** Pin the clock (otherwise live). */
  now?: Date;
  /** Password that unlocks the demo. */
  password?: string;
  /** Start in a state, for stories: idle, typing, checking, failed, caps lock on. */
  state?: "idle" | "typing" | "checking" | "failed" | "capslock";
  battery?: number;
  media?: { title: string; artist: string } | null;
  onUnlock?: () => void;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** hyprlock: blurred wallpaper, big clock, square password field with check / fail / caps states. */
export function LockScreen({
  user = "romeo",
  now,
  password = "arch",
  state = "idle",
  battery = 82,
  media = { title: "Midnight City", artist: "M83" },
  onUnlock,
  width = 1280,
  height = 720,
  className,
}: LockScreenProps) {
  const [tick, setTick] = useState(() => new Date());
  const clock = now ?? tick;
  const [value, setValue] = useState(state === "typing" || state === "checking" || state === "failed" ? "hunter22" : "");
  const [phase, setPhase] = useState<"idle" | "checking" | "failed" | "unlocked">(
    state === "checking" ? "checking" : state === "failed" ? "failed" : "idle",
  );
  const [caps, setCaps] = useState(state === "capslock");
  const [attempts, setAttempts] = useState(state === "failed" ? 1 : 0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (now) return;
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, [now]);

  const submit = () => {
    setPhase("checking");
    setTimeout(() => {
      if (value === password) {
        setPhase("unlocked");
        setTimeout(() => onUnlock?.(), 450);
      } else {
        setPhase("failed");
        setAttempts((a) => a + 1);
        setValue("");
      }
    }, 650);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    setCaps(e.getModifierState("CapsLock"));
    if (e.key === "Enter" && value) submit();
    else if (phase === "failed") setPhase("idle");
  };

  const fieldState = phase === "unlocked" ? "ok" : phase === "checking" ? "check" : phase === "failed" ? "fail" : caps ? "caps" : "idle";
  const date = clock.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div
      className={["rx-lock", phase === "unlocked" && "is-unlocked", className].filter(Boolean).join(" ")}
      style={{ width, height }}
      onClick={() => input.current?.focus()}
    >
      <Wallpaper variant="image" className="rx-lock-wall" />
      <div className="rx-lock-scrim" />
      <div className="rx-lock-center">
        <div className="rx-lock-time">
          {pad(clock.getHours())}
          <span>:</span>
          {pad(clock.getMinutes())}
        </div>
        <div className="rx-lock-date">{date}</div>
        <div className="rx-lock-user">
          <span className="rx-lock-avatar">
            <Icon name="account" size={30} />
          </span>
          {user}
        </div>
        <label className={`rx-lock-field is-${fieldState}`} key={attempts}>
          <input
            ref={input}
            type="password"
            value={value}
            autoComplete="off"
            aria-label="password"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))}
            disabled={phase === "checking" || phase === "unlocked"}
          />
          <span className="rx-lock-dots" aria-hidden>
            {value ? Array.from(value, (_, i) => <i key={i} />) : <em>{phase === "failed" ? "wrong password" : "password"}</em>}
          </span>
          <Icon name={fieldState === "ok" ? "check" : fieldState === "fail" ? "alert" : "lock"} size={16} className="rx-lock-icon" />
        </label>
        <div className="rx-lock-hint">
          {phase === "checking"
            ? "checking…"
            : phase === "failed"
              ? `authentication failed · ${attempts} attempt${attempts > 1 ? "s" : ""}`
              : caps
                ? "caps lock is on"
                : `enter to unlock · try “${password}”`}
        </div>
      </div>
      <div className="rx-lock-foot">
        <span>
          <Icon name="flash" size={14} /> {battery}%
        </span>
        <span>
          <Icon name="wifi" size={14} /> home-5G
        </span>
        <span>
          <Icon name="keyboard" size={14} /> us
        </span>
        <span className="hx-spacer" />
        {media && (
          <span className="rx-lock-media">
            <Icon name="music" size={14} /> {media.title} <span className="hx-faint">· {media.artist}</span>
          </span>
        )}
      </div>
    </div>
  );
}
