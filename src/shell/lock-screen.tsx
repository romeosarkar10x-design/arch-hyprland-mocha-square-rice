import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon, cx } from "../ui";
import { BlurredWallpaper, PasswordField, UserAvatar } from "./password-field";

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

  return (
    <div
      data-component="LockScreen"
      className={cx("kit-type relative max-w-full overflow-hidden bg-crust text-text", className)}
      style={{ width, height }}
      onClick={() => input.current?.focus()}
    >
      <BlurredWallpaper />
      <div
        className={cx(
          "absolute inset-0 flex flex-col items-center justify-center gap-2.5 transition-[opacity,scale] duration-(--hx-slow) ease-hx",
          phase === "unlocked" && "scale-[1.04] opacity-0",
        )}
      >
        <LockClock clock={clock} />
        <div className="mb-1.5 flex flex-col items-center gap-2 font-bold">
          <UserAvatar />
          {user}
        </div>
        <PasswordField
          key={attempts}
          inputRef={input}
          state={fieldState}
          value={value}
          placeholder={phase === "failed" ? "wrong password" : "password"}
          icon={fieldState === "ok" ? "check" : fieldState === "fail" ? "alert" : "lock"}
          autoComplete="off"
          aria-label="password"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))}
          disabled={phase === "checking" || phase === "unlocked"}
        />
        <div className="h-4 text-[11px] text-overlay1">
          {phase === "checking"
            ? "checking…"
            : phase === "failed"
              ? `authentication failed · ${attempts} attempt${attempts > 1 ? "s" : ""}`
              : caps
                ? "caps lock is on"
                : `enter to unlock · try “${password}”`}
        </div>
      </div>
      <LockStatus battery={battery} media={media} />
    </div>
  );
}

function LockClock({ clock }: { clock: Date }) {
  const date = clock.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return (
    <>
      <div data-component="LockClock" className="text-[128px] leading-[.9] font-bold tracking-[-.05em]">
        {pad(clock.getHours())}
        <span className="animate-caret text-mauve">:</span>
        {pad(clock.getMinutes())}
      </div>
      <div className="mb-[34px] text-[15px] tracking-[.3em] text-subtext0 lowercase">{date}</div>
    </>
  );
}

/** Bottom strip: battery, network, layout, now playing. */
function LockStatus({ battery, media }: { battery: number; media: LockScreenProps["media"] }) {
  const item = "inline-flex items-center gap-1.5";
  return (
    <div data-component="LockStatus" className="absolute inset-x-0 bottom-0 flex gap-[22px] px-[22px] py-3.5 text-[12px] text-subtext0">
      <span className={item}>
        <Icon name="flash" size={14} /> {battery}%
      </span>
      <span className={item}>
        <Icon name="wifi" size={14} /> home-5G
      </span>
      <span className={item}>
        <Icon name="keyboard" size={14} /> us
      </span>
      <span className={cx(item, "flex-1")} />
      {media && (
        <span className={item}>
          <Icon name="music" size={14} className="text-green" /> {media.title} <span className="text-overlay1">· {media.artist}</span>
        </span>
      )}
    </div>
  );
}
