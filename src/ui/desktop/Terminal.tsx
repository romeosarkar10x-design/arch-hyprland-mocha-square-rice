import type { ReactNode } from "react";
import { cx } from "../lib";

/** A command typed at the prompt, or a block of its output. */
export type TerminalLine = { cmd: string; out?: never } | { out: ReactNode; cmd?: never };

const DEFAULT_LINES: TerminalLine[] = [
  { cmd: "fastfetch --logo-type small" },
  {
    out: (
      <span className="hx-term-ff">
        <span className="hx-mauve">{"  ▲   "}</span>
        <b className="hx-mauve">romeo</b>@<b className="hx-mauve">archlinux</b>
        {"\n"}
        <span className="hx-mauve">{" ▲ ▲  "}</span>
        <span className="hx-faint">────────────────────</span>
        {"\n"}
        <span className="hx-mauve">{"▲   ▲ "}</span>
        <span className="hx-sky">os</span>
        {"      Arch Linux x86_64"}
        {"\n"}
        {"      "}
        <span className="hx-sky">kernel</span>
        {"  7.2.2-arch1-1"}
        {"\n"}
        {"      "}
        <span className="hx-sky">wm</span>
        {"      Hyprland 0.56.2 (lua)"}
        {"\n"}
        {"      "}
        <span className="hx-sky">cpu</span>
        {"     Ryzen 9 9900X (12) @ 5.66 GHz"}
        {"\n"}
        {"      "}
        <span className="hx-sky">gpu</span>
        {"     GeForce RTX 3090 Ti"}
        {"\n"}
        {"      "}
        <span className="hx-sky">memory</span>
        {"  9.41 GiB / 30.5 GiB"}
        {"\n"}
        {"      "}
        <span className="hx-sky">font</span>
        {"    MonoLisa 13"}
        {"\n"}
        {"      "}
        <span className="hx-crust-bg">{"   "}</span>
        <span className="hx-red-bg">{"   "}</span>
        <span className="hx-green-bg">{"   "}</span>
        <span className="hx-yellow-bg">{"   "}</span>
        <span className="hx-blue-bg">{"   "}</span>
        <span className="hx-mauve-bg">{"   "}</span>
        <span className="hx-teal-bg">{"   "}</span>
        <span className="hx-text-bg">{"   "}</span>
      </span>
    ),
  },
  { cmd: "git status -sb" },
  {
    out: (
      <>
        <span className="hx-green">## main</span>
        ...
        <span className="hx-red">origin/main</span>
        {" [ahead 1]"}
        {"\n"} <span className="hx-yellow">M</span>
        {" waybar/.config/waybar/style.css"}
        {"\n"} <span className="hx-yellow">M</span>
        {" hyprland/.config/hypr/hyprland.lua"}
        {"\n"}
        <span className="hx-red">??</span>
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
    <div className={cx("hx-term", className)}>
      {lines.map((l, i) =>
        l.cmd != null ? (
          <Prompt key={i} cwd={cwd} cmd={l.cmd} />
        ) : (
          <div key={i} className="hx-term-out">
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
    <div className="hx-term-prompt">
      <span className="hx-term-cwd">{cwd}</span>
      <span className="hx-term-branch">{" main"}</span>
      <span className="hx-mauve">{" ❯ "}</span>
      <span>{cmd}</span>
      {cursor && <span className="hx-caret" />}
    </div>
  );
}
