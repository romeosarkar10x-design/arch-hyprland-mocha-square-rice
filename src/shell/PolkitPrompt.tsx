import { useState } from "react";
import { Button, Icon, IconTile } from "../ui";
import "./shell.css";

export interface PolkitPromptProps {
  /** The command or action asking for privileges. */
  command?: string;
  /** polkit action id. */
  action?: string;
  identity?: string;
  /** Show a failed attempt. */
  failed?: boolean;
  onAuthenticate?: (password: string) => void;
  onCancel?: () => void;
  className?: string;
}

/** hyprpolkitagent: the "authentication required" dialog shown for pkexec / systemctl / pacman GUIs. */
export function PolkitPrompt({
  command = "/usr/bin/pacman -Syu",
  action = "org.archlinux.pkexec.pacman",
  identity = "romeo",
  failed = false,
  onAuthenticate,
  onCancel,
  className,
}: PolkitPromptProps) {
  const [pw, setPw] = useState("");
  const [details, setDetails] = useState(false);
  return (
    <form
      className={["rx-polkit", failed && "is-failed", className].filter(Boolean).join(" ")}
      onSubmit={(e) => {
        e.preventDefault();
        onAuthenticate?.(pw);
      }}
    >
      <i className="hx-corner tl" />
      <i className="hx-corner tr" />
      <i className="hx-corner bl" />
      <i className="hx-corner br" />
      <div className="rx-polkit-head">
        <IconTile icon="lock" accent={failed ? "red" : "yellow"} size={44} />
        <div>
          <b>Authentication required</b>
          <p className="hx-dim">
            Authentication is needed to run <code>{command}</code> as the super user.
          </p>
        </div>
      </div>
      <div className="rx-polkit-body">
        <span className="hx-caps">identity</span>
        <div className="rx-polkit-id">
          <Icon name="account" size={16} /> {identity} <span className="hx-faint">(wheel)</span>
        </div>
        <span className="hx-caps">password</span>
        <label className={`rx-lock-field is-${failed ? "fail" : "idle"}`}>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="password" autoFocus />
          <span className="rx-lock-dots" aria-hidden>
            {pw ? Array.from(pw, (_, i) => <i key={i} />) : <em>{failed ? "sorry, try again" : `password for ${identity}`}</em>}
          </span>
          <Icon name={failed ? "alert" : "lock"} size={16} className="rx-lock-icon" />
        </label>
        <button type="button" className="rx-polkit-more" onClick={() => setDetails((d) => !d)}>
          <Icon name={details ? "down" : "chevronRight"} size={12} /> details
        </button>
        {details && (
          <dl className="hx-kv rx-polkit-details">
            <dt>action</dt>
            <dd>{action}</dd>
            <dt>vendor</dt>
            <dd>Arch Linux</dd>
            <dt>agent</dt>
            <dd>hyprpolkitagent 0.1.3</dd>
          </dl>
        )}
      </div>
      <div className="hx-panel-actions">
        <span className="hx-spacer" />
        <Button type="button" variant="ghost" kbd="ESC" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" accent="yellow" icon="lock" kbd="⏎">
          Authenticate
        </Button>
      </div>
    </form>
  );
}
