import { useRef, useState, type PointerEvent } from "react";
import { Icon } from "../foundations/icon";
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
    <div
      data-component="Slider"
      className={cx("kit-type flex items-center gap-2.5 text-text", className)}
      style={{ ["--hx-acc" as string]: accentVar(accent) }}
    >
      {icon && (
        <button
          type="button"
          className={cx(
            "unbutton grid size-7 flex-none cursor-pointer place-items-center text-[17px] transition-[background-color]",
            muted ? "bg-surface0 text-overlay1" : "bg-acc/14 text-acc hover:bg-acc/26",
          )}
          onClick={onIconClick}
          aria-label={label ? `${label} toggle` : "toggle"}
        >
          <Icon name={icon} />
        </button>
      )}
      <div
        ref={ref}
        className="group/track relative h-6 flex-1 cursor-pointer touch-none"
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
        <i className="absolute inset-x-0 top-[9px] h-1.5 bg-surface0" />
        <i
          className={cx(
            "absolute top-[9px] left-0 h-1.5",
            muted ? "bg-surface2" : "bg-[repeating-linear-gradient(90deg,var(--hx-acc)_0_6px,color-mix(in_srgb,var(--hx-acc)_75%,transparent)_6px_8px)]",
          )}
          style={{ width: `${pct}%` }}
        />
        {ticks > 0 && (
          <span className="pointer-events-none absolute inset-x-0 top-[19px] flex h-1 justify-between">
            {Array.from({ length: ticks }, (_, i) => (
              <i key={i} className="w-px bg-surface1" />
            ))}
          </span>
        )}
        <i
          className={cx(
            "absolute top-1 -ml-1 h-4 w-2 bg-text shadow-[0_0_0_3px_var(--hx-mantle)] transition-[scale,background-color]",
            "group-hover/track:scale-y-[1.2] group-hover/track:bg-acc",
            drag && "scale-y-[1.2] bg-acc",
          )}
          style={{ left: `${pct}%` }}
        />
      </div>
      {showValue && <span className={cx("min-w-[38px] text-right text-[12px]", muted ? "text-overlay1" : "text-acc")}>{format(v)}</span>}
    </div>
  );
}
