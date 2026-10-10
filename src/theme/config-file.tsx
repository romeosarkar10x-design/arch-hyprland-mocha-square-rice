import { useState, type ReactNode } from "react";
import { Button, Icon } from "../ui";
import { terminalConfig, CONFIG_PATHS, type Emulator, type TerminalOptions } from "./exports";
import { useCssPalette } from "./use-css-palette";
import "./theme.css";

const COMMENT = /^\s*(#|\/\/|--|\/\*)/;
const HEX = /(#[0-9a-fA-F]{6}\b|rgba\([0-9a-fA-F]{8}\)|\b[0-9a-fA-F]{6}\b)/g;

/** One line, with every colour value given a swatch. */
function highlight(line: string): ReactNode {
  if (COMMENT.test(line)) return <span className="hx-faint">{line}</span>;
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(HEX)) {
    const raw = m[0];
    const hex = raw.startsWith("rgba(") ? `#${raw.slice(5, 11)}` : raw.startsWith("#") ? raw : `#${raw}`;
    // Bare 6-digit runs only count after `=`/`:`/space (ghostty, foot), never inside words.
    if (!raw.startsWith("#") && !raw.startsWith("rgba(") && !/[\s=:]$/.test(line.slice(0, m.index))) continue;
    parts.push(line.slice(last, m.index));
    parts.push(
      <span key={m.index} className="rx-cfg-hex">
        <i style={{ background: hex }} />
        {raw}
      </span>,
    );
    last = m.index + raw.length;
  }
  parts.push(line.slice(last));
  const key = line.match(/^(\s*)([\w.-]+)(\s*[=:]\s*|\s+)/);
  if (key && parts.length === 1) {
    return (
      <>
        {key[1]}
        <span className="hx-lavender">{key[2]}</span>
        {line.slice(key[1]!.length + key[2]!.length)}
      </>
    );
  }
  return parts;
}

export interface ConfigFileProps {
  /** Path shown in the header, e.g. `~/.config/kitty/kitty.conf`. */
  file: string;
  /** File contents. */
  text: string;
  /** Max height before it scrolls. */
  maxHeight?: number;
  className?: string;
}

/** A dotfile with colour swatches next to every colour value, and a copy button. */
export function ConfigFile({ file, text, maxHeight = 420, className }: ConfigFileProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };
  return (
    <figure className={["rx-cfg", className].filter(Boolean).join(" ")}>
      <figcaption>
        <Icon name="code" size={14} />
        <span className="rx-cfg-file">{file}</span>
        <Button size="sm" variant="ghost" icon={copied ? "check" : "plus"} accent={copied ? "green" : "mauve"} onClick={copy}>
          {copied ? "copied" : "copy"}
        </Button>
      </figcaption>
      <pre style={{ maxHeight }}>
        {text.replace(/\n$/, "").split("\n").map((line, i) => (
          <div key={i}>{line ? highlight(line) : " "}</div>
        ))}
      </pre>
    </figure>
  );
}

export interface TerminalConfigProps extends TerminalOptions {
  emulator?: Emulator;
  maxHeight?: number;
  className?: string;
}

/** The config file for a terminal emulator, generated from the theme in effect where it renders. */
export function TerminalConfig({ emulator = "ghostty", maxHeight, className, ...options }: TerminalConfigProps) {
  const [ref, palette] = useCssPalette();
  return (
    <div ref={ref}>
      <ConfigFile file={CONFIG_PATHS[emulator]} text={terminalConfig[emulator](palette, options)} maxHeight={maxHeight} className={className} />
    </div>
  );
}
