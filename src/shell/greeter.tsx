import { useState } from "react";
import { Button, Icon, IconButton, Wallpaper } from "../ui";
import "./shell.css";

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
    <div className={["rx-greet", className].filter(Boolean).join(" ")} style={{ width, height }}>
      <Wallpaper variant="image" className="rx-lock-wall" />
      <div className="rx-lock-scrim" />
      <header className="rx-greet-top">
        <Icon name="arch" size={16} className="hx-mauve" />
        <b>{hostname}</b>
        <span className="hx-faint">Arch Linux · greetd</span>
        <span className="hx-spacer" />
        <span>{now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
        <b>
          {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
        </b>
      </header>
      <form
        className="rx-greet-card"
        onSubmit={(e) => {
          e.preventDefault();
          onLogin?.(u.name, sessions[session]!);
        }}
      >
        <i className="hx-corner tl" />
        <i className="hx-corner tr" />
        <i className="hx-corner bl" />
        <i className="hx-corner br" />
        <div className="rx-greet-users" role="radiogroup" aria-label="user">
          {users.map((x, i) => (
            <button key={x.name} type="button" className={i === user ? "is-active" : undefined} onClick={() => setUser(i)} aria-checked={i === user} role="radio">
              <span className="rx-lock-avatar">
                <Icon name="account" size={i === user ? 34 : 22} />
              </span>
              <span>{x.name}</span>
            </button>
          ))}
        </div>
        <div className="rx-greet-name">{u.full ?? u.name}</div>
        <label className="rx-greet-row">
          <span className="hx-caps">session</span>
          <button
            type="button"
            className="rx-greet-select"
            onClick={() => setSession((s) => (s + 1) % sessions.length)}
            title="cycle sessions"
          >
            <Icon name="chevronLeft" size={14} />
            <span>{sessions[session]}</span>
            <Icon name="chevronRight" size={14} />
          </button>
        </label>
        <label className="rx-lock-field is-idle rx-greet-pw">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="password" autoComplete="off" />
          <span className="rx-lock-dots" aria-hidden>
            {pw ? Array.from(pw, (_, i) => <i key={i} />) : <em>password</em>}
          </span>
          <Icon name="lock" size={16} className="rx-lock-icon" />
        </label>
        <Button variant="primary" size="lg" block icon="chevronRight" kbd="⏎">
          Log in
        </Button>
      </form>
      <footer className="rx-greet-power">
        <IconButton icon="suspend" label="Suspend" variant="outline" accent="sky" onClick={() => onPower?.("suspend")} />
        <IconButton icon="reboot" label="Reboot" variant="outline" accent="peach" onClick={() => onPower?.("reboot")} />
        <IconButton icon="power" label="Shut down" variant="outline" accent="red" onClick={() => onPower?.("shutdown")} />
      </footer>
    </div>
  );
}
