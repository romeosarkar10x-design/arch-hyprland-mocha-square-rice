// What runs inside <TerminalEmulator>. Colours are ANSI indices (`c(n)`), so every program
// follows the terminal palette, which itself follows the active theme.
import type { ReactNode } from "react";
import { cx } from "../ui";

export const PROGRAMS = ["fastfetch", "shell", "btop", "yazi", "nvim", "pacman"] as const;
export type Program = (typeof PROGRAMS)[number];

// ANSI colour n as a text / background utility. Spelled out so Tailwind sees every class.
// prettier-ignore
export const fg = [
  "text-(--rx-ansi-0)", "text-(--rx-ansi-1)", "text-(--rx-ansi-2)", "text-(--rx-ansi-3)", "text-(--rx-ansi-4)", "text-(--rx-ansi-5)", "text-(--rx-ansi-6)", "text-(--rx-ansi-7)",
  "text-(--rx-ansi-8)", "text-(--rx-ansi-9)", "text-(--rx-ansi-10)", "text-(--rx-ansi-11)", "text-(--rx-ansi-12)", "text-(--rx-ansi-13)", "text-(--rx-ansi-14)", "text-(--rx-ansi-15)",
];
// prettier-ignore
export const bg = [
  "bg-(--rx-ansi-0)", "bg-(--rx-ansi-1)", "bg-(--rx-ansi-2)", "bg-(--rx-ansi-3)", "bg-(--rx-ansi-4)", "bg-(--rx-ansi-5)", "bg-(--rx-ansi-6)", "bg-(--rx-ansi-7)",
  "bg-(--rx-ansi-8)", "bg-(--rx-ansi-9)", "bg-(--rx-ansi-10)", "bg-(--rx-ansi-11)", "bg-(--rx-ansi-12)", "bg-(--rx-ansi-13)", "bg-(--rx-ansi-14)", "bg-(--rx-ansi-15)",
];

/** A highlighted row (btop's selected process, yazi's hovered file): crust text on blue. */
const selected = cx(bg[4], "font-bold text-crust! **:font-bold **:text-crust!");

/** Text in ANSI colour `n` (0-15). `bg` paints the background instead. */
function c(n: number, text: ReactNode, opts: { bg?: number; bold?: boolean; dim?: boolean } = {}) {
  return <span className={cx(fg[n], opts.bg !== undefined && bg[opts.bg], opts.bold && "font-bold", opts.dim && "italic opacity-70")}>{text}</span>;
}

/** The terminal cursor; its shape and blink come from the emulator root (`group/term`). */
const cursor =
  "inline-block h-[1.2em] w-[.6em] bg-mauve align-[-.2em] group-data-[cursor=beam]/term:w-0.5 " +
  "group-data-[cursor=underline]/term:h-0.5 group-data-[cursor=underline]/term:align-[-.15em] group-data-blink/term:animate-[rx-blink_1s_steps(1)_infinite]";

const ARCH_ASCII = `                  -\`
                 .o+\`
                \`ooo/
               \`+oooo:
              \`+oooooo:
              -+oooooo+:
            \`/:-:++oooo+:
           \`/++++/+++++++:
          \`/++++++++++++++:
         \`/+++ooooooooooooo/\`
        ./ooosssso++osssssso+\`
       .oossssso-\`\`\`\`/ossssss+\`
      -osssssso.      :ssssssso.
     :osssssss/        osssso+++.
    /ossssssss/        +ssssooo/-
  \`/ossssso+/:-        -:/+osssso+-
 \`+sso+:-\`                 \`.-/+oso:
\`++:.                           \`-/+/
.\`                                 \`/`;

function Prompt({ cwd = "~", branch, took, children }: { cwd?: string; branch?: string; took?: string; children?: ReactNode }) {
  return (
    <div data-component="Prompt" className="contents">
      <div>
        {c(4, cwd, { bold: true })}
        {branch && <> {c(8, "on")} {c(5, `⎇ ${branch}`)}</>}
        {branch && <> {c(1, "[!2?1]")}</>}
        {took && <> {c(8, "took")} {c(3, took)}</>}
      </div>
      <div>
        {c(2, "❯ ", { bold: true })}
        {children ?? <span className={cursor} />}
      </div>
    </div>
  );
}

function Fastfetch({ terminal }: { terminal: string }) {
  const rows: [string, string][] = [
    ["OS", "Arch Linux x86_64"],
    ["Host", "X870E AORUS ELITE WIFI7"],
    ["Kernel", "Linux 7.2.9-arch1-1"],
    ["Uptime", "3 hours, 12 mins"],
    ["Packages", "1312 (pacman), 9 (flatpak)"],
    ["Shell", "zsh 5.9"],
    ["Display", "2560x1440 @ 165 Hz [DP-1]"],
    ["WM", "Hyprland 0.52.1 (Wayland)"],
    ["Theme", "hyprland-ui [square]"],
    ["Font", "asiLonoM (12pt)"],
    ["Terminal", terminal],
    ["CPU", "AMD Ryzen 9 9900X (24) @ 5.66 GHz"],
    ["GPU", "NVIDIA GeForce RTX 3090 Ti"],
    ["Memory", "9.42 GiB / 30.50 GiB (31%)"],
    ["Disk (/)", "412.8 GiB / 1.82 TiB (22%) - btrfs"],
  ];
  return (
    <div data-component="Fastfetch" className="contents">
      <Prompt cwd="~">fastfetch</Prompt>
      <div className="mt-[.4em] mb-[.6em] flex gap-[2.5em]">
        <pre className={cx(fg[12], "m-0 font-bold [font:inherit]")}>{ARCH_ASCII}</pre>
        <div>
          <div>
            {c(12, "romeo", { bold: true })}@{c(12, "archlinux", { bold: true })}
          </div>
          <div>{"-".repeat(15)}</div>
          {rows.map(([k, v]) => (
            <div key={k}>
              {c(12, k, { bold: true })}: {v}
            </div>
          ))}
          <div className="mt-[.6em] grid auto-rows-[1.2em] grid-cols-[repeat(8,2.4em)]">
            {Array.from({ length: 16 }, (_, i) => (
              <i key={i} className={bg[i]} />
            ))}
          </div>
        </div>
      </div>
      <Prompt cwd="~" took="84ms" />
    </div>
  );
}

function Shell() {
  const files: [string, string, string, string, number][] = [
    ["drwxr-xr-x", "-", "9 Oct 21:40", ".config", 4],
    ["drwxr-xr-x", "-", "8 Oct 18:02", "components", 4],
    ["drwxr-xr-x", "-", "10 Oct 09:15", "src", 4],
    ["drwxr-xr-x", "-", "10 Oct 09:15", "stories", 4],
    [".rw-r--r--", "1.2k", "10 Oct 09:12", "package.json", 3],
    [".rw-r--r--", "3.4k", "9 Oct 22:31", "README.md", 15],
    [".rw-r--r--", "38k", "9 Oct 22:31", "styles.css", 5],
    [".rwxr-xr-x", "2.1k", "10 Oct 08:40", "install.sh", 2],
  ];
  return (
    <div data-component="Shell" className="contents">
      <Prompt cwd="~/github/rice" branch="main">
        eza -la --git
      </Prompt>
      {files.map(([perm, size, date, name, colour]) => (
        <div key={name}>
          {c(perm.startsWith("d") ? 4 : 8, perm[0])}
          {[...perm.slice(1)].map((ch, i) => (
            <span key={i} className={fg[ch === "r" ? 3 : ch === "w" ? 1 : ch === "x" ? 2 : 8]}>
              {ch}
            </span>
          ))}
          {"  "}
          {c(2, size.padStart(4), { bold: true })} {c(3, "romeo")} {c(4, date.padStart(12))}{" "}
          {c(perm.startsWith("d") || name === "install.sh" ? colour : 7, name, { bold: perm.startsWith("d") })}
        </div>
      ))}
      <Prompt cwd="~/github/rice" branch="main">
        git log --oneline -3
      </Prompt>
      <div>
        {c(3, "192a9fd")} {c(6, "(HEAD -> main)")} Test commit...
      </div>
      <div>
        {c(3, "a41c0de")} feat: wallpaper-driven theme
      </div>
      <div>
        {c(3, "77e2b10")} chore: sync hyprland-ui 0.1.0
      </div>
      <Prompt cwd="~/github/rice" branch="main" took="1s" />
    </div>
  );
}

const loadBg = (v: number) => bg[v > 80 ? 1 : v > 55 ? 3 : 2];

function bars(values: number[]) {
  return values.map((v, i) => <i key={i} style={{ height: `${v}%` }} className={cx("flex-1 opacity-90", loadBg(v))} />);
}

const box = "m-0 min-w-0 overflow-hidden border border-(--rx-ansi-8) px-2 pt-0.5 pb-1.5";
const meter = "mx-[.5em] inline-block h-[.55em] w-[6em] bg-surface0 align-[.1em]";

function Btop() {
  const cpu = [22, 30, 28, 41, 38, 52, 47, 35, 29, 33, 45, 61, 72, 58, 40, 36, 31, 44, 50, 63, 85, 77, 54, 42, 38, 35, 41, 47, 39, 33, 30, 28, 36, 49, 55, 48];
  const procs: [number, string, string, string, string][] = [
    [4182, "Hyprland", "romeo", "6.2", "412M"],
    [9921, "ghostty", "romeo", "3.1", "188M"],
    [7710, "chrome", "romeo", "2.8", "1.4G"],
    [8120, "nvim", "romeo", "1.4", "96M"],
    [3301, "pipewire", "romeo", "0.9", "34M"],
    [6650, "waybar", "romeo", "0.6", "61M"],
    [5122, "spotify", "romeo", "0.5", "402M"],
  ];
  return (
    <div data-component="Btop" className="grid h-full grid-cols-[1.25fr_1fr] grid-rows-[auto_auto_1fr] gap-x-1.5 gap-y-0.5">
      <fieldset className={cx(box, "col-span-full grid grid-cols-[1fr_auto] gap-3")}>
        <legend className="px-1">{c(6, "cpu")} {c(8, "│ Ryzen 9 9900X │ 5.66 GHz")}</legend>
        <div className="flex h-[7.8em] items-end gap-0.5 pt-[.3em]">{bars(cpu)}</div>
        <div className="grid grid-cols-[repeat(2,auto)] content-start gap-x-3.5">
          {[18, 41, 9, 77, 32, 55, 12, 64, 27, 38, 91, 20].map((v, i) => (
            <div key={i}>
              {c(8, `C${i}`.padEnd(4))}
              <span className={meter}>
                <i style={{ width: `${v}%` }} className={cx("block h-full", loadBg(v))} />
              </span>
              {`${v}%`.padStart(5)}
            </div>
          ))}
        </div>
      </fieldset>
      <fieldset className={box}>
        <legend className="px-1">{c(5, "mem")}</legend>
        {[
          ["Used", 31, "9.42G", 5],
          ["Cached", 18, "5.41G", 4],
          ["Free", 51, "15.6G", 2],
        ].map(([k, v, s, col]) => (
          <div key={k as string} className="flex items-center">
            {(k as string).padEnd(7)}
            <span className={cx(meter, "flex-1")}>
              <i style={{ width: `${v}%` }} className={cx("block h-full", bg[col as number])} />
            </span>
            {(s as string).padStart(6)}
          </div>
        ))}
      </fieldset>
      <fieldset className={box}>
        <legend className="px-1">{c(4, "net")} {c(8, "│ wlan0")}</legend>
        <div className="flex items-center">
          {c(2, "▼")} 12.4 MiB/s {c(8, "total 3.1G")}
        </div>
        <div className="flex items-center">
          {c(5, "▲")} 840 KiB/s {c(8, "total 402M")}
        </div>
      </fieldset>
      <fieldset className={cx(box, "col-span-full")}>
        <legend className="px-1">{c(1, "proc")} {c(8, "│ cpu lazy │ tree")}</legend>
        <div className="font-bold text-overlay1">
          {"  Pid Program      User     Cpu%   Mem"}
        </div>
        {procs.map(([pid, name, user, load, mem], i) => (
          <div key={pid} className={i === 0 ? selected : undefined}>
            {String(pid).padStart(5)} {name.padEnd(12)} {user.padEnd(8)} {load.padStart(4)} {mem.padStart(5)}
          </div>
        ))}
      </fieldset>
    </div>
  );
}

function Yazi() {
  const parent = ["Desktop", "Documents", "Downloads", "github", "Music", "Pictures", "Videos"];
  const here: [string, boolean][] = [
    [".config", true], ["components", true], ["src", true], ["stories", true],
    ["wallpapers", true], ["README.md", false], ["package.json", false], ["styles.css", false], ["install.sh", false],
  ];
  return (
    <div data-component="Yazi" className="flex h-full flex-col">
      <div className="pb-[.4em]">
        {c(4, "~/github/rice/", { bold: true })}
        {c(7, "wallpapers", { bold: true })}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_1.6fr_1.6fr] gap-0 *:overflow-hidden *:px-[.6em] *:not-first:border-l *:not-first:border-(--rx-ansi-8)">
        <div>
          {parent.map((p) => (
            <div key={p} className={p === "github" ? bg[8] : undefined}>
              {c(4, p)}
            </div>
          ))}
        </div>
        <div>
          {here.map(([name, dir]) => (
            <div key={name} className={name === "wallpapers" ? selected : undefined}>
              {name === "wallpapers" ? name : c(dir ? 4 : name.endsWith(".sh") ? 2 : 7, name, { bold: dir })}
            </div>
          ))}
        </div>
        <div>
          {["aurora.svg", "bauhaus.svg", "contour.svg", "dune.svg", "ember.svg", "glacier.svg", "nebula.svg", "outrun.svg"].map((f) => (
            <div key={f}>
              {c(5, f)}
              <span className={fg[8]}>{"  12K"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-[.4em] flex">
        {c(0, " NOR ", { bg: 4, bold: true })}
        {c(4, " 10 items ", { bg: 0 })} {c(3, "drwxr-xr-x")}
        <span className="flex-1" />
        {c(7, "5/9  ")}
        {c(0, " 55% ", { bg: 4 })}
      </div>
    </div>
  );
}

function Nvim() {
  const code: ReactNode[] = [
    <>{c(5, "import")} {"{ "}{c(3, "extractTheme")}{" } "}{c(5, "from")} {c(2, '"./theme/palette"')};</>,
    <></>,
    <>{c(8, "// Retheme the desktop from the current wallpaper.", { dim: true })}</>,
    <>{c(5, "export async function")} {c(4, "applyWallpaper")}({c(1, "src")}: {c(3, "string")}) {"{"}</>,
    <>{"  "}{c(5, "const")} {"{ "}{c(1, "palette")}{" } = "}{c(5, "await")} {c(4, "extractTheme")}(src, {"{ "}vibrancy: {c(2, '"balanced"')}{" }"});</>,
    <>{"  "}{c(5, "for")} ({c(5, "const")} [slot, hex] {c(5, "of")} {c(3, "Object")}.{c(4, "entries")}(palette)) {"{"}</>,
    <>{"    "}document.documentElement.style.{c(4, "setProperty")}({c(2, "`--hx-${slot}`")}, hex);</>,
    <>{"  }"}</>,
    <>{"  "}{c(5, "return")} palette.{c(6, "mauve")};</>,
    <>{"}"}</>,
  ];
  return (
    <div data-component="Nvim" className="m-[calc(var(--rx-term-pad,12px)*-1)] flex h-full flex-col">
      <div className="flex bg-crust">
        {c(0, " theme.ts ", { bg: 5, bold: true })}
        {c(8, " palette.ts ")}
        {c(8, " exports.ts ")}
      </div>
      <div className="flex-1 pt-[.3em]">
        {code.map((line, i) => (
          <div key={i} className={i === 4 ? "bg-surface0/60" : undefined}>
            <span className={fg[i === 4 ? 3 : 8]}>{String(i === 4 ? 5 : Math.abs(i - 4)).padStart(3)} </span>
            {line}
          </div>
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <div key={`t${i}`} className={fg[8]}>
            {"    ~"}
          </div>
        ))}
      </div>
      <div className="m-0 flex bg-mantle">
        {c(0, " NORMAL ", { bg: 4, bold: true })}
        {c(7, " ⎇ main ", { bg: 0 })}
        {c(7, " src/theme.ts ")}
        <span className="flex-1" />
        {c(7, " typescript ")}
        {c(0, " 5:24 ", { bg: 4 })}
      </div>
    </div>
  );
}

function Pacman() {
  const candy = (pct: number) => {
    const width = 26, done = Math.round((pct / 100) * width);
    return (
      <>
        [{c(8, "-".repeat(done))}
        {pct < 100 && c(3, "C", { bold: true })}
        {pct < 100 && c(7, " o".repeat(Math.max(0, Math.floor((width - done - 1) / 2))).padEnd(width - done - 1))}]
        {` ${String(pct).padStart(3)}%`}
      </>
    );
  };
  return (
    <div data-component="Pacman" className="contents">
      <Prompt cwd="~">sudo pacman -Syu</Prompt>
      <div>{c(4, "::", { bold: true })} {c(15, "Synchronizing package databases...", { bold: true })}</div>
      <div> core{" ".repeat(15)}117.3 KiB  780 KiB/s 00:00 {candy(100)}</div>
      <div> extra{" ".repeat(14)}  8.0 MiB 21.4 MiB/s 00:00 {candy(100)}</div>
      <div>{c(4, "::", { bold: true })} {c(15, "Starting full system upgrade...", { bold: true })}</div>
      <div>resolving dependencies...</div>
      <div>looking for conflicting packages...</div>
      <div>&nbsp;</div>
      <div>
        {c(15, "Packages (5)", { bold: true })} hyprland-0.52.1-1 linux-7.2.10.arch1-1 mesa-1:26.1.2-1 waybar-0.13.0-2 ghostty-1.2.1-1
      </div>
      <div>&nbsp;</div>
      <div>{c(15, "Total Download Size:", { bold: true })}   182.44 MiB</div>
      <div>{c(15, "Net Upgrade Size:", { bold: true })}        2.31 MiB</div>
      <div>&nbsp;</div>
      <div>{c(4, "::", { bold: true })} {c(15, "Proceed with installation? [Y/n]", { bold: true })} y</div>
      <div> linux-7.2.10.arch1-1{" ".repeat(9)}   142.1 MiB 24.0 MiB/s 00:03 {candy(64)}</div>
      <div> mesa-1:26.1.2-1{" ".repeat(14)}    18.4 MiB 21.2 MiB/s 00:01 {candy(22)}</div>
    </div>
  );
}

export function renderProgram(program: Program, terminal: string): ReactNode {
  switch (program) {
    case "fastfetch": return <Fastfetch terminal={terminal} />;
    case "shell": return <Shell />;
    case "btop": return <Btop />;
    case "yazi": return <Yazi />;
    case "nvim": return <Nvim />;
    case "pacman": return <Pacman />;
  }
}
