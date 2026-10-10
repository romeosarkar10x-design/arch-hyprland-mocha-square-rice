import type { ReactNode } from "react";
import { cx } from "../lib";

const DEFAULT_CODE = `-- look and feel
local mocha = require("mocha")

hl.config({
  general = {
    gaps_in = 3,
    gaps_out = 6,
    border_size = 2,
    col = {
      active_border = { mocha.mauve, mocha.pink, mocha.yellow, angle = 45 },
      inactive_border = rgba(mocha.surface0, "cc"),
    },
  },
  decoration = {
    rounding = 0,
    inactive_opacity = 0.94,
    dim_inactive = true,
    blur = { size = 6, passes = 3, noise = 0.02 },
  },
})

hl.animation("borderangle", { speed = 60, curve = "linear", style = "loop" })`;

export interface CodeViewProps {
  /** File name in the status line. */
  file?: string;
  /** Source lines; tokens get coloured by a tiny Lua/JS-ish highlighter. */
  code?: string;
  /** 1-based line holding the cursor. */
  cursorLine?: number;
  /** Vim mode in the status line. */
  mode?: "NORMAL" | "INSERT" | "VISUAL";
  className?: string;
}

const modeFill = { NORMAL: "bg-blue", INSERT: "bg-green", VISUAL: "bg-mauve" };

/** Neovim-style editor body: relative line numbers, cursor line, tiny Lua highlighter and a mode status line. */
export function CodeView({ file = "hyprland.lua", code = DEFAULT_CODE, cursorLine = 8, mode = "NORMAL", className }: CodeViewProps) {
  const lines = code.split("\n");
  return (
    <div data-component="CodeView" className={cx("kit-type absolute inset-0 flex flex-col text-[12.5px] leading-[1.6] text-text", className)}>
      <div className="flex-1 overflow-hidden pt-2">
        {lines.map((l, i) => {
          const cur = i + 1 === cursorLine;
          return (
            <div key={i} className={cx("grid grid-cols-[46px_1fr] whitespace-pre", cur && "bg-surface0")}>
              <span className={cx("pr-3.5 text-right", cur ? "text-yellow" : "text-surface2")}>{cur ? i + 1 : Math.abs(i + 1 - cursorLine)}</span>
              <span>{colour(l)}</span>
            </div>
          );
        })}
      </div>
      <CodeStatusLine file={file} mode={mode} cursorLine={cursorLine} />
    </div>
  );
}

/** Vim status line: mode block, branch, file, filetype, cursor position. */
function CodeStatusLine({ file, mode, cursorLine }: { file: string; mode: NonNullable<CodeViewProps["mode"]>; cursorLine: number }) {
  return (
    <div data-component="CodeStatusLine" className="flex h-[22px] items-stretch bg-crust text-[11.5px] *:flex *:items-center *:px-2.5">
      <span className={cx("font-bold text-crust", modeFill[mode])}>{mode}</span>
      <span className="bg-surface0 text-pink">{" main"}</span>
      <span>{file}</span>
      <span className="flex-1" />
      <span className="text-overlay1">lua · utf-8</span>
      <span className="bg-blue text-crust">
        {cursorLine}
        :9
      </span>
    </div>
  );
}

function colour(line: string) {
  if (/^\s*--/.test(line)) return <span className="text-overlay1 italic">{line}</span>;
  const re = /("[^"]*")|(\b(?:local|function|return|end|true|false|nil|require)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-z_]+(?=\s*=))|([{}()])/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? "text-green" : m[2] ? "text-mauve" : m[3] ? "text-peach" : m[4] ? "text-lavender" : "text-overlay1";
    out.push(
      <span key={k++} className={cls}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  out.push(line.slice(last));
  return out;
}
