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

/** Neovim-style editor body: relative line numbers, cursor line, tiny Lua highlighter and a mode status line. */
export function CodeView({ file = "hyprland.lua", code = DEFAULT_CODE, cursorLine = 8, mode = "NORMAL", className }: CodeViewProps) {
  const lines = code.split("\n");
  return (
    <div className={cx("hx-code", className)}>
      <div className="hx-code-body">
        {lines.map((l, i) => (
          <div key={i} className={cx("hx-code-line", i + 1 === cursorLine && "is-cursor")}>
            <span className="hx-code-ln">{i + 1 === cursorLine ? i + 1 : Math.abs(i + 1 - cursorLine)}</span>
            <span className="hx-code-src">{colour(l)}</span>
          </div>
        ))}
      </div>
      <div className="hx-code-status">
        <span className={cx("hx-code-mode", `is-${mode.toLowerCase()}`)}>{mode}</span>
        <span className="hx-code-branch">{" main"}</span>
        <span className="hx-code-file">{file}</span>
        <span className="hx-spacer" />
        <span className="hx-faint">lua · utf-8</span>
        <span className="hx-code-pos">
          {cursorLine}
          :9
        </span>
      </div>
    </div>
  );
}

function colour(line: string) {
  if (/^\s*--/.test(line)) return <span className="hx-overlay1 hx-italic">{line}</span>;
  const re = /("[^"]*")|(\b(?:local|function|return|end|true|false|nil|require)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-z_]+(?=\s*=))|([{}()])/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? "hx-green" : m[2] ? "hx-mauve" : m[3] ? "hx-peach" : m[4] ? "hx-lavender" : "hx-overlay1";
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
