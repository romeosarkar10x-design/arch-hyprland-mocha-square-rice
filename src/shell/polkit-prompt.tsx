import { useState } from "react";
import { Button, Corners, Icon, IconTile, KeyValueList, PanelActions, cx } from "../ui";
import { PasswordField } from "./password-field";

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
      data-component="PolkitPrompt"
      className={cx(
        "kit-type relative w-[460px] max-w-full bg-mantle text-text shadow-popup ring ring-surface0",
        failed ? "[--hx-acc:var(--hx-red)]" : "[--hx-acc:var(--hx-yellow)]",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        onAuthenticate?.(pw);
      }}
    >
      <Corners />
      <div className="flex gap-3.5 border-b border-surface0 px-[18px] pt-[18px] pb-3.5">
        <IconTile icon="lock" accent={failed ? "red" : "yellow"} size={44} />
        <div>
          <b className="text-[14px]">Authentication required</b>
          <p className="mt-1 mb-0 text-[12px] leading-[1.5] text-subtext0">
            Authentication is needed to run <code className="text-yellow [font:inherit]">{command}</code> as the super user.
          </p>
        </div>
      </div>
      <div className="grid gap-2 px-[18px] pt-3.5 pb-4">
        <span className="caps">identity</span>
        <div className="flex h-[30px] items-center gap-2 bg-surface0 px-2.5 text-[12.5px]">
          <Icon name="account" size={16} className="text-yellow" /> {identity} <span className="text-overlay1">(wheel)</span>
        </div>
        <span className="caps">password</span>
        <PasswordField
          className="w-full"
          state={failed ? "fail" : "idle"}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          aria-label="password"
          autoFocus
          placeholder={failed ? "sorry, try again" : `password for ${identity}`}
          icon={failed ? "alert" : "lock"}
        />
        <button
          type="button"
          className="unbutton inline-flex cursor-pointer items-center gap-1 justify-self-start font-hx text-[11px] text-overlay1 hover:text-text"
          onClick={() => setDetails((d) => !d)}
        >
          <Icon name={details ? "down" : "chevronRight"} size={12} /> details
        </button>
        {details && (
          <KeyValueList className="text-[11px]">
            <dt>action</dt>
            <dd>{action}</dd>
            <dt>vendor</dt>
            <dd>Arch Linux</dd>
            <dt>agent</dt>
            <dd>hyprpolkitagent 0.1.3</dd>
          </KeyValueList>
        )}
      </div>
      <PanelActions>
        <span className="flex-1" />
        <Button type="button" variant="ghost" kbd="ESC" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" accent="yellow" icon="lock" kbd="⏎">
          Authenticate
        </Button>
      </PanelActions>
    </form>
  );
}
