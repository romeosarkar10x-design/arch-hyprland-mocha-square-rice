import { useRef, useState, type PointerEvent } from "react";
import { Icon } from "../foundations/Icon";
import { type IconName } from "../icons";
import { accentVar, clamp, cx, type Accent } from "../lib";

export interface SliderProps {
  /** Controlled value 0–max. Omit to use `defaultValue`. */
  value?: number;
  defaultValue?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  accent?: Accent;
  /** Icon at the left end (click target for e.g. mute). */
  icon?: IconName;
  onIconClick?: () => void;
  /** Show the value at the right end, e.g. "64%". */
  showValue?: boolean;
  /** Formats the value readout. */
  format?: (value: number) => string;
  /** Number of tick marks under the track (0 for none). */
  ticks?: number;
  /** Greys the fill, e.g. while muted. */
  muted?: boolean;
  label?: string;
  className?: string;
}

/** Volume / brightness slider: drag, click, wheel and arrow keys. Optional icon button on the left (e.g. mute). */
export function Slider({
  value,
  defaultValue = 50,
  max = 100,
  step = 1,
  onChange,
  accent = "yellow",
  icon,
  onIconClick,
  showValue = true,
  format = (v) => `${Math.round(v)}%`,
  ticks = 11,
  muted,
  label,
  className,
}: SliderProps) {
  const [inner, setInner] = useState(defaultValue);
  const v = value ?? inner;
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const set = (n: number) => {
    const s = clamp(Math.round(n / step) * step, 0, max);
    setInner(s);
    onChange?.(s);
  };
  const fromEvent = (e: PointerEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * max);
  };
  const pct = (v / max) * 100;
  return (
    <div className={cx("hx-slider", muted && "is-muted", className)} style={{ ["--hx-acc" as string]: accentVar(accent) }}>
      {icon && (
        <button type="button" className="hx-slider-icon" onClick={onIconClick} aria-label={label ? `${label} toggle` : "toggle"}>
          <Icon name={icon} />
        </button>
      )}
      <div
        ref={ref}
        className={cx("hx-slider-track", drag && "is-drag")}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(v)}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setDrag(true);
          fromEvent(e);
        }}
        onPointerMove={(e) => drag && fromEvent(e)}
        onPointerUp={() => setDrag(false)}
        onWheel={(e) => set(v + (e.deltaY < 0 ? step * 2 : -step * 2))}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            set(v + step);
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            set(v - step);
          }
        }}
      >
        <i className="hx-slider-rail" />
        <i className="hx-slider-fill" style={{ width: `${pct}%` }} />
        {ticks > 0 && (
          <span className="hx-slider-ticks">
            {Array.from({ length: ticks }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        )}
        <i className="hx-slider-thumb" style={{ left: `${pct}%` }} />
      </div>
      {showValue && <span className="hx-slider-value">{format(v)}</span>}
    </div>
  );
}
