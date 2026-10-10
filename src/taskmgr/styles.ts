// Shared Task Manager utilities: square, hairlines, mauve focus; dense like htop, laid out like Windows'.
import { cx } from "../ui";

/** Native <select>, squared off. */
export const select =
  "h-[26px] rounded-none border border-surface0 bg-mantle px-1.5 font-[inherit] text-[12px] text-text focus-visible:border-mauve focus-visible:outline-none";

/** A button that reads as a link (go to a process, a parent…). */
export const link = "unbutton cursor-pointer text-left text-blue! hover:underline";

/** Command lines: ellipsised, dimmed. */
export const cmd = "truncate font-hx text-subtext0";

/** A checkbox with its label. */
export const check = "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap [&_input]:m-0 [&_input]:accent-mauve";

/** Small flag next to a name: `uncatchable`, `user`, `defunct`. */
export const tag = (tone?: "red" | "yellow") =>
  cx(
    "px-[5px] text-[10.5px] leading-4 whitespace-nowrap",
    tone === "red" ? "bg-red/22 text-red" : tone === "yellow" ? "bg-yellow/22 text-yellow" : "bg-surface0 text-subtext0",
  );

/** Process state letter (R S D T Z I) in a tinted square. */
export const state = (s: string) =>
  cx(
    "inline-grid size-4 place-items-center text-[10.5px] font-bold text-overlay1",
    s === "R" && "bg-green/22 text-green",
    s === "D" && "bg-peach/22 text-peach",
    s === "T" && "bg-yellow/22 text-yellow",
    s === "Z" && "bg-red/22 text-red",
  );

/** "Σ 4" / "+3": how many processes a row stands for. */
export const count = "flex-none bg-mauve/14 px-[5px] text-[10.5px] leading-4 text-mauve";

/** Toolbar strip under the title / above a table. */
export const toolbar = "flex flex-none flex-wrap items-center gap-2 border-b border-surface0 px-2.5 py-2";

/** Search box: icon + bare input. */
export const search =
  "flex h-[28px] w-[278px] items-center gap-1.5 border border-surface0 bg-mantle px-2 text-overlay1 focus-within:border-mauve [&_input]:uninput [&_input]:flex-1 [&_input]:text-[12px] [&_input]:text-text";

/** Segmented radio group; mark the active button with `aria-checked`. */
export const seg = "inline-flex shadow-[0_0_0_1px_var(--hx-surface0)]";
export const segButton =
  "unbutton h-[26px] cursor-pointer bg-mantle px-2.5 text-[12px] text-subtext0 capitalize not-first:border-l not-first:border-surface0 hover:text-text " +
  "aria-checked:bg-surface1 aria-checked:font-bold aria-checked:text-mauve [&_small]:font-normal [&_small]:text-overlay1";

/** Floating menu (columns picker, context menu). */
export const menu =
  "absolute z-30 flex min-w-[220px] flex-col bg-crust p-1 shadow-[0_0_0_1px_var(--hx-surface1),var(--hx-shadow-popup)] animate-[rx-tm-pop_var(--hx-fast)_var(--hx-ease)_both]";

/** Scrolling page body (Users, Services, Startup). */
export const page = "flex min-h-0 flex-1 flex-col overflow-auto";

/** Plain data table with sticky header. Right-align a column with `text-right` on its cells. Cells stay content-box: Chrome's table layout treats max-width differently under border-box. */
export const table =
  "w-full border-collapse tabular-nums " +
  "[&_th]:sticky [&_th]:top-0 [&_th]:z-1 [&_th]:box-content [&_th]:h-8 [&_th]:border-b [&_th]:border-surface0 [&_th]:bg-base [&_th]:px-2.5 [&_th]:py-0 [&_th]:text-left [&_th]:text-[11.5px] [&_th]:font-normal [&_th]:whitespace-nowrap [&_th]:text-overlay1 " +
  "[&_td]:box-content [&_td]:h-8 [&_td]:max-w-[380px] [&_td]:border-b [&_td]:border-surface0/60 [&_td]:px-2.5 [&_td]:py-0 [&_td]:whitespace-nowrap [&_td>*]:align-middle";

/** Table row: hover tint, `selected` adds the mauve edge. */
export const tr = (selected?: boolean) => cx("cursor-default hover:bg-surface0/55", selected && "bg-surface0! shadow-[inset_2px_0_0_var(--hx-mauve)]");

/** Dialog card, centred over the window. */
export const dialog =
  "absolute top-1/2 left-1/2 z-41 flex max-h-[calc(100%-38px)] w-[min(560px,calc(100%-32px))] -translate-1/2 flex-col border-t-2 border-mauve bg-base shadow-[0_0_0_1px_var(--hx-surface1),var(--hx-shadow-popup)] outline-none animate-[rx-tm-pop_var(--hx-med)_var(--hx-ease-overshot)_both]";
export const dialogHeader = "flex items-center gap-2.5 border-b border-surface0 px-3.5 py-3";
export const dialogFooter = "flex flex-wrap items-center gap-2.5 border-t border-surface0 bg-mantle px-3.5 py-2.5";
