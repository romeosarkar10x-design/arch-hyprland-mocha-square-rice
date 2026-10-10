import { type InputHTMLAttributes, type Ref } from "react";
import { Icon, Wallpaper, cx, type IconName } from "../ui";

export type PasswordFieldState = "idle" | "check" | "fail" | "caps" | "ok";

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "placeholder"> {
  value: string;
  /** Frame colour: surface1 (mauve while focused), yellow checking, red + shake on failure, peach for caps lock, green when accepted. */
  state?: PasswordFieldState;
  /** Shown in place of the dots while empty. */
  placeholder?: string;
  icon?: IconName;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
}

const frame: Record<PasswordFieldState, string> = {
  idle: "[--rx-field:var(--hx-surface1)] focus-within:[--rx-field:var(--hx-mauve)]",
  check: "[--rx-field:var(--hx-yellow)]",
  fail: "animate-[rx-shake_.38s] [--rx-field:var(--hx-red)]",
  caps: "[--rx-field:var(--hx-peach)]",
  ok: "[--rx-field:var(--hx-green)]",
};

/** hyprlock-style password box: the typed characters are square dots over an invisible input. */
export function PasswordField({ value, state = "idle", placeholder = "password", icon = "lock", inputRef, className, ...input }: PasswordFieldProps) {
  return (
    <label
      data-component="PasswordField"
      className={cx(
        "relative flex h-11 w-[348px] cursor-text items-center bg-mantle/88 px-3.5 shadow-[inset_0_0_0_2px_var(--rx-field)] transition-[box-shadow]",
        frame[state],
        className,
      )}
    >
      <input ref={inputRef} type="password" value={value} className="uninput absolute inset-0 cursor-text opacity-0" {...input} />
      <span className="pointer-events-none flex flex-1 items-center gap-[7px] overflow-hidden" aria-hidden>
        {value ? (
          Array.from(value, (_, i) => <i key={i} className="size-[9px] flex-none animate-[hx-pop-up_.12s_both] bg-text" />)
        ) : (
          <em className={cx("text-[12.5px] not-italic", state === "fail" ? "text-red" : "text-overlay1")}>{placeholder}</em>
        )}
      </span>
      <Icon name={icon} size={16} className="pointer-events-none text-(--rx-field)" />
    </label>
  );
}

/** Square account tile; the selected / signed-in user gets a mauve frame. */
export function UserAvatar({ size = 64, iconSize = 30, active = true, className }: { size?: number; iconSize?: number; active?: boolean; className?: string }) {
  return (
    <span
      data-component="UserAvatar"
      className={cx("grid place-items-center bg-surface0", active ? "text-mauve ring-2 ring-mauve" : "text-overlay1", className)}
      style={{ width: size, height: size }}
    >
      <Icon name="account" size={iconSize} />
    </span>
  );
}

/** The wallpaper, blurred past the edges, under a vignette: the backdrop of the lock screen and greeter. */
export function BlurredWallpaper() {
  return (
    <div data-component="BlurredWallpaper" className="contents">
      <Wallpaper variant="image" className="-inset-10 blur-[14px] saturate-[1.1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--hx-crust)_35%,transparent),color-mix(in_srgb,var(--hx-crust)_75%,transparent))]" />
    </div>
  );
}
