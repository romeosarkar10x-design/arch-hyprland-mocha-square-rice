import { useState } from "react";
import { Button, Corners, Icon, IconButton, cx } from "../ui";
import { BlurredWallpaper, PasswordField, UserAvatar } from "./password-field";

export interface GreeterUser {
  name: string;
  full?: string;
}

export interface GreeterProps {
  users?: GreeterUser[];
  sessions?: string[];
  hostname?: string;
  /** Pin the clock. */
  now?: Date;
  onLogin?: (user: string, session: string) => void;
  onPower?: (action: "suspend" | "reboot" | "shutdown") => void;
  width?: number | string;
  height?: number | string;
  className?: string;
}

/** Login screen (greetd / SDDM): user, session and password, with power actions. */
export function Greeter({
  users = [{ name: "romeo", full: "Romeo Sarkar" }, { name: "guest" }],
  sessions = ["Hyprland", "Hyprland (uwsm)", "Plasma (Wayland)", "TTY shell"],
  hostname = "archlinux",
  now = new Date(2026, 9, 10, 9, 41),
  onLogin,
  onPower,
  width = 1280,
  height = 720,
  className,
}: GreeterProps) {
  const [user, setUser] = useState(0);
  const [session, setSession] = useState(0);
  const [pw, setPw] = useState("");
  const u = users[user] ?? users[0]!;
  return (
    <div data-component="Greeter" className={cx("kit-type relative max-w-full overflow-hidden bg-crust text-text", className)} style={{ width, height }}>
      <BlurredWallpaper />
      <header className="absolute inset-x-0 top-0 flex h-(--hx-bar-height) items-center gap-3 bg-bar-ground px-4 text-[12px] shadow-[0_1px_0_var(--hx-surface0)]">
        <Icon name="arch" size={16} className="text-mauve" />
        <b>{hostname}</b>
        <span className="text-overlay1">Arch Linux · greetd</span>
        <span className="flex-1" />
        <span>{now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
        <b>
          {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
        </b>
      </header>
      <form
        data-component="GreeterCard"
        className="absolute top-1/2 left-1/2 flex w-[440px] -translate-1/2 flex-col items-center gap-3.5 bg-mantle/92 px-[30px] pt-7 pb-[30px] shadow-popup ring ring-surface0 [--hx-acc:var(--hx-mauve)]"
        onSubmit={(e) => {
          e.preventDefault();
          onLogin?.(u.name, sessions[session]!);
        }}
      >
        <Corners />
        <div className="flex items-end gap-[18px]" role="radiogroup" aria-label="user">
          {users.map((x, i) => (
            <button
              key={x.name}
              type="button"
              className={cx("unbutton flex cursor-pointer flex-col items-center gap-1.5 font-hx text-[11px]", i === user ? "text-text" : "text-overlay1")}
              onClick={() => setUser(i)}
              aria-checked={i === user}
              role="radio"
            >
              <UserAvatar active={i === user} size={i === user ? 72 : 40} iconSize={i === user ? 34 : 22} />
              <span>{x.name}</span>
            </button>
          ))}
        </div>
        <div className="text-[16px] font-bold">{u.full ?? u.name}</div>
        <label className="flex w-full items-center justify-between">
          <span className="caps">session</span>
          <button
            type="button"
            className="unbutton inline-flex h-[30px] cursor-pointer items-center gap-2.5 bg-surface0 px-2 font-hx text-[12px] text-text hover:bg-surface1 [&_svg]:text-mauve"
            onClick={() => setSession((s) => (s + 1) % sessions.length)}
            title="cycle sessions"
          >
            <Icon name="chevronLeft" size={14} />
            <span>{sessions[session]}</span>
            <Icon name="chevronRight" size={14} />
          </button>
        </label>
        <PasswordField className="w-full" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="password" autoComplete="off" />
        <Button variant="primary" size="lg" block icon="chevronRight" kbd="⏎">
          Log in
        </Button>
      </form>
      <footer className="absolute right-[18px] bottom-[18px] flex gap-2">
        <IconButton icon="suspend" label="Suspend" variant="outline" accent="sky" onClick={() => onPower?.("suspend")} />
        <IconButton icon="reboot" label="Reboot" variant="outline" accent="peach" onClick={() => onPower?.("reboot")} />
        <IconButton icon="power" label="Shut down" variant="outline" accent="red" onClick={() => onPower?.("shutdown")} />
      </footer>
    </div>
  );
}
