import { useState, type ReactNode } from "react";
import { accentVar, cx, type Accent } from "../lib";

export interface ToggleProps {
  /** Controlled state. Omit to let the toggle manage itself from `defaultChecked`. */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  accent?: Accent;
  /** Visible label to the left of the switch. */
  label?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** Square switch with an overshooting knob. Optional label and description make it a full settings row. */
export function Toggle({ checked, defaultChecked = false, onChange, accent, label, description, disabled, className }: ToggleProps) {
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const flip = () => {
    if (disabled) return;
    setInner(!on);
    onChange?.(!on);
  };
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={flip}
      data-component="ToggleSwitch"
      className={cx(
        "unbutton relative h-5 w-9 flex-none cursor-pointer bg-surface1 transition-[background-color] duration-(--hx-med)",
        "after:absolute after:top-[3px] after:left-[3px] after:size-[14px] after:bg-overlay1",
        "after:transition-[translate,background-color] after:duration-(--hx-med) after:ease-overshot",
        "aria-checked:bg-acc aria-checked:after:translate-x-4 aria-checked:after:bg-crust disabled:cursor-default disabled:opacity-40",
      )}
      style={{ ["--hx-acc" as string]: accentVar(accent) }}
    />
  );
  if (!label)
    return (
      <span data-component="Toggle" className={className}>
        {sw}
      </span>
    );
  return (
    <label
      data-component="Toggle"
      className={cx("kit-type flex cursor-pointer items-center gap-4 py-1.5 text-text", disabled && "cursor-default opacity-50", className)}
    >
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[12.5px]">{label}</span>
        {description && <span className="text-[11px] text-overlay1">{description}</span>}
      </span>
      {sw}
    </label>
  );
}
