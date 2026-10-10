import type { ReactNode } from "react";
import { cx } from "../lib";

/** A command typed at the prompt, or a block of its output. */
export type TerminalLine = { cmd: string; out?: never } | { out: ReactNode; cmd?: never };

const DEFAULT_LINES: TerminalLine[] = [
  { cmd: "fastfetch --logo-type small" },
  {
    out: (
      <span>
        <span className="text-mauve">{"  ▲   "}</span>
        <b className="text-mauve">romeo</b>@<b className="text-mauve">archlinux</b>
        {"\n"}
        <span className="text-mauve">{" ▲ ▲  "}</span>
        <span className="text-overlay1">────────────────────</span>
        {"\n"}
        <span className="text-mauve">{"▲   ▲ "}</span>
        <span className="text-sky">os</span>
        {"      Arch Linux x86_64"}
        {"\n"}
        {"      "}
        <span className="text-sky">kernel</span>
        {"  7.2.2-arch1-1"}
        {"\n"}
        {"      "}
        <span className="text-sky">wm</span>
        {"      Hyprland 0.56.2 (lua)"}
        {"\n"}
        {"      "}
        <span className="text-sky">cpu</span>
        {"     Ryzen 9 9900X (12) @ 5.66 GHz"}
        {"\n"}
        {"      "}
        <span className="text-sky">gpu</span>
        {"     GeForce RTX 3090 Ti"}
        {"\n"}
        {"      "}
        <span className="text-sky">memory</span>
        {"  9.41 GiB / 30.5 GiB"}
        {"\n"}
        {"      "}
        <span className="text-sky">font</span>
        {"    asiLonoM 13"}
        {"\n"}
        {"      "}
        <span className="bg-surface1">{"   "}</span>
        <span className="bg-red">{"   "}</span>
        <span className="bg-green">{"   "}</span>
        <span className="bg-yellow">{"   "}</span>
        <span className="bg-blue">{"   "}</span>
        <span className="bg-mauve">{"   "}</span>
        <span className="bg-teal">{"   "}</span>
        <span className="bg-text">{"   "}</span>
      </span>
    ),
  },
  { cmd: "git status -sb" },
  {
    out: (
      <>
        <span className="text-green">## main</span>
        ...
        <span className="text-red">origin/main</span>
        {" [ahead 1]"}
        {"\n"} <span className="text-yellow">M</span>
        {" waybar/.config/waybar/style.css"}
        {"\n"} <span className="text-yellow">M</span>
        {" hyprland/.config/hypr/hyprland.lua"}
        {"\n"}
        <span className="text-red">??</span>
        {" design/hyprland-ui/"}
      </>
    ),
  },
];

export interface TerminalProps {
  lines?: TerminalLine[];
  /** Working directory shown in the prompt. */
  cwd?: string;
  /** Show the blinking block cursor on a final empty prompt. */
  cursor?: boolean;
  className?: string;
}

/** Ghostty-style terminal body: sapphire cwd, pink branch, mauve ❯ prompt, block cursor. Default content is fastfetch + git status. */
export function Terminal({ lines = DEFAULT_LINES, cwd = "~/dotfiles", cursor = true, className }: TerminalProps) {
  return (
    <div data-component="Terminal" className={cx("kit-type overflow-hidden px-3.5 py-3 text-[12.5px] leading-[1.55] whitespace-pre text-text", className)}>
      {lines.map((l, i) =>
        l.cmd != null ? (
          <Prompt key={i} cwd={cwd} cmd={l.cmd} />
        ) : (
          <div key={i} className="mb-1.5 text-text">
            {l.out}
          </div>
        ),
      )}
      {cursor && <Prompt cwd={cwd} cmd="" cursor />}
    </div>
  );
}

function Prompt({ cwd, cmd, cursor }: { cwd: string; cmd: string; cursor?: boolean }) {
  return (
    <div data-component="Prompt" className="flex items-center">
      <span className="font-bold text-sapphire">{cwd}</span>
      <span className="text-pink">{" main"}</span>
      <span className="text-mauve">{" ❯ "}</span>
      <span>{cmd}</span>
      {cursor && <span className="inline-block h-[1.2em] w-[.6em] animate-caret bg-text" />}
    </div>
  );
}
