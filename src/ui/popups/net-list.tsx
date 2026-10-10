import type { ReactNode } from "react";
import { cx } from "../lib";

/** Four signal bars, `level` 0-4 lit. */
export function SignalBars({ level }: { level: number }) {
  return (
    <span data-component="SignalBars" className="inline-flex h-3.5 w-[18px] flex-none items-end gap-0.5" aria-label={`signal ${level} of 4`}>
      {[1, 2, 3, 4].map((i) => (
        <i key={i} className={cx("flex-1", i <= level ? "bg-sapphire" : "bg-surface1")} style={{ height: `${25 * i}%` }} />
      ))}
    </span>
  );
}

/** Edge-to-edge list of networks / devices inside a flush PanelSection. */
export function NetList({ children }: { children: ReactNode }) {
  return (
    <ul data-component="NetList" className="kit-type m-0 list-none px-0 py-1 text-text">
      {children}
    </ul>
  );
}

/** A row's main line: name over a dim status line. */
export function NetRowLabel({ name, status }: { name: ReactNode; status: ReactNode }) {
  return (
    <span data-component="NetRowLabel" className="flex min-w-0 flex-1 flex-col">
      {name}
      <small className="text-[10.5px] text-overlay1">{status}</small>
    </span>
  );
}

/** Row chrome shared by Wi-Fi buttons and Bluetooth rows; `active` draws the accent strip. */
export const netRow = (active: boolean) =>
  cx("unbutton flex w-full items-center gap-3 bg-transparent p-2 text-left font-hx text-[12.5px] text-text", active && "shadow-[inset_2px_0_0_var(--hx-acc)]");

/** "scanning…" with a pulsing ellipsis. */
export function Scanning() {
  return (
    <span data-component="Scanning" className="text-overlay1 after:animate-[hx-pulse_1.2s_ease-in-out_infinite] after:content-['…']">
      scanning
    </span>
  );
}
