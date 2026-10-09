// What runs inside <TerminalEmulator>. Colours are ANSI indices (`c(n)`), so every program
// follows the terminal palette, which itself follows the active theme.
import type { ReactNode } from "react";

export const PROGRAMS = ["fastfetch", "shell", "btop", "yazi", "nvim", "pacman"] as const;
export type Program = (typeof PROGRAMS)[number];

/** Text in ANSI colour `n` (0-15). `bg` paints the background instead. */
function c(n: number, text: ReactNode, opts: { bg?: number; bold?: boolean; dim?: boolean } = {}) {
  const cls = [`rx-a${n}`];
  if (opts.bg !== undefined) cls.push(`rx-b${opts.bg}`);
  if (opts.bold) cls.push("rx-bold");
  if (opts.dim) cls.push("rx-dimc");
  return <span className={cls.join(" ")}>{text}</span>;
}

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
    <>
      <div>
        {c(4, cwd, { bold: true })}
        {branch && <> {c(8, "on")} {c(5, `⎇ ${branch}`)}</>}
        {branch && <> {c(1, "[!2?1]")}</>}
        {took && <> {c(8, "took")} {c(3, took)}</>}
      </div>
      <div>
        {c(2, "❯ ", { bold: true })}
        {children ?? <span className="rx-cursor" />}
      </div>
    </>
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
    <>
      <Prompt cwd="~">fastfetch</Prompt>
      <div className="rx-ff">
        <pre className="rx-a12 rx-bold">{ARCH_ASCII}</pre>
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
          <div className="rx-ff-blocks">
            {Array.from({ length: 16 }, (_, i) => (
              <i key={i} className={`rx-b${i}`} />
            ))}
          </div>
        </div>
      </div>
      <Prompt cwd="~" took="84ms" />
    </>
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
    <>
      <Prompt cwd="~/github/rice" branch="main">
        eza -la --git
      </Prompt>
      {files.map(([perm, size, date, name, colour]) => (
        <div key={name}>
          {c(perm.startsWith("d") ? 4 : 8, perm[0])}
          {[...perm.slice(1)].map((ch, i) => (
            <span key={i} className={ch === "r" ? "rx-a3" : ch === "w" ? "rx-a1" : ch === "x" ? "rx-a2" : "rx-a8"}>
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
    </>
  );
}

function bars(values: number[]) {
  return values.map((v, i) => <i key={i} style={{ height: `${v}%` }} className={v > 80 ? "rx-b1" : v > 55 ? "rx-b3" : "rx-b2"} />);
}

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
    <div className="rx-btop">
      <fieldset className="rx-btop-cpu">
        <legend>{c(6, "cpu")} {c(8, "│ Ryzen 9 9900X │ 5.66 GHz")}</legend>
        <div className="rx-btop-graph">{bars(cpu)}</div>
        <div className="rx-btop-cores">
          {[18, 41, 9, 77, 32, 55, 12, 64, 27, 38, 91, 20].map((v, i) => (
            <div key={i}>
              {c(8, `C${i}`.padEnd(4))}
              <span className="rx-btop-meter">
                <i style={{ width: `${v}%` }} className={v > 80 ? "rx-b1" : v > 55 ? "rx-b3" : "rx-b2"} />
              </span>
              {`${v}%`.padStart(5)}
            </div>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>{c(5, "mem")}</legend>
        {[
          ["Used", 31, "9.42G", 5],
          ["Cached", 18, "5.41G", 4],
          ["Free", 51, "15.6G", 2],
        ].map(([k, v, s, col]) => (
          <div key={k as string} className="rx-btop-row">
            {(k as string).padEnd(7)}
            <span className="rx-btop-meter">
              <i style={{ width: `${v}%` }} className={`rx-b${col}`} />
            </span>
            {(s as string).padStart(6)}
          </div>
        ))}
      </fieldset>
      <fieldset>
        <legend>{c(4, "net")} {c(8, "│ wlan0")}</legend>
        <div className="rx-btop-row">
          {c(2, "▼")} 12.4 MiB/s {c(8, "total 3.1G")}
        </div>
        <div className="rx-btop-row">
          {c(5, "▲")} 840 KiB/s {c(8, "total 402M")}
        </div>
      </fieldset>
      <fieldset className="rx-btop-proc">
        <legend>{c(1, "proc")} {c(8, "│ cpu lazy │ tree")}</legend>
        <div className="rx-btop-th">
          {"  Pid Program      User     Cpu%   Mem"}
        </div>
        {procs.map(([pid, name, user, load, mem], i) => (
          <div key={pid} className={i === 0 ? "rx-b4 rx-sel" : undefined}>
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
    <div className="rx-yazi">
      <div className="rx-yazi-top">
        {c(4, "~/github/rice/", { bold: true })}
        {c(7, "wallpapers", { bold: true })}
      </div>
      <div className="rx-yazi-panes">
        <div>
          {parent.map((p) => (
            <div key={p} className={p === "github" ? "rx-b8" : undefined}>
              {c(4, p)}
            </div>
          ))}
        </div>
        <div>
          {here.map(([name, dir]) => (
            <div key={name} className={name === "wallpapers" ? "rx-b4 rx-sel" : undefined}>
              {name === "wallpapers" ? name : c(dir ? 4 : name.endsWith(".sh") ? 2 : 7, name, { bold: dir })}
            </div>
          ))}
        </div>
        <div>
          {["aurora.svg", "bauhaus.svg", "contour.svg", "dune.svg", "ember.svg", "glacier.svg", "nebula.svg", "outrun.svg"].map((f) => (
            <div key={f}>
              {c(5, f)}
              <span className="rx-a8">{"  12K"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rx-yazi-status">
        {c(0, " NOR ", { bg: 4, bold: true })}
        {c(4, " 10 items ", { bg: 0 })} {c(3, "drwxr-xr-x")}
        <span className="rx-fill" />
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
    <div className="rx-nvim">
      <div className="rx-nvim-tabs">
        {c(0, " theme.ts ", { bg: 5, bold: true })}
        {c(8, " palette.ts ")}
        {c(8, " exports.ts ")}
      </div>
      <div className="rx-nvim-code">
        {code.map((line, i) => (
          <div key={i} className={i === 4 ? "rx-nvim-cur" : undefined}>
            <span className={i === 4 ? "rx-a3" : "rx-a8"}>{String(i === 4 ? 5 : Math.abs(i - 4)).padStart(3)} </span>
            {line}
          </div>
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <div key={`t${i}`} className="rx-a8">
            {"    ~"}
          </div>
        ))}
      </div>
      <div className="rx-nvim-status">
        {c(0, " NORMAL ", { bg: 4, bold: true })}
        {c(7, " ⎇ main ", { bg: 0 })}
        {c(7, " src/theme.ts ")}
        <span className="rx-fill" />
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
    <>
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
    </>
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
