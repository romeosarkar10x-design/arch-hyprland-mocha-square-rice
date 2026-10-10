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
      className="hx-toggle"
      style={{ ["--hx-acc" as string]: accentVar(accent) }}
    />
  );
  if (!label) return <span className={className}>{sw}</span>;
  return (
    <label className={cx("hx-toggle-row", disabled && "is-disabled", className)}>
      <span className="hx-toggle-text">
        <span className="hx-toggle-label">{label}</span>
        {description && <span className="hx-toggle-desc">{description}</span>}
      </span>
      {sw}
    </label>
  );
}
