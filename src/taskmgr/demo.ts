// A plausible snapshot of this rice's machine: kernel threads, systemd services, the
// greetd → Hyprland session with its clients, terminals with jobs, Firefox / Electron
// helper trees, a Postgres container, a zombie, a stopped job and a runaway script.

import type { Machine, Proc, ProcState, Unit } from "./procs.ts";

export const ME = "romeo";
export const UIDS: Record<string, number> = { root: 0, [ME]: 1000, dbus: 81, polkitd: 102, "systemd-timesync": 975, postgres: 999 };
const MiB = 1024;

type Opts = Partial<Omit<Proc, "pid" | "ppid" | "name">> & { mib?: number; sharedMib?: number };

function p(pid: number, ppid: number, name: string, o: Opts = {}): Proc {
  const { mib = 0, sharedMib, ...rest } = o;
  const uss = Math.round(mib * MiB);
  const shared = Math.round((sharedMib ?? Math.min(60, 4 + mib * 0.3)) * MiB);
  const kernel = !!o.kernel;
  return {
    pid,
    ppid,
    name,
    cmd: name,
    user: ME,
    state: kernel ? "I" : "S",
    nice: 0,
    threads: 1,
    cpu: 0,
    uss: kernel ? 0 : uss,
    shared: kernel ? 0 : shared,
    pss: kernel ? 0 : Math.round(uss + shared * 0.28),
    swap: 0,
    vsz: kernel ? 0 : Math.round((uss + shared) * 3.2 + 180 * MiB),
    read: 0,
    write: 0,
    start: 2,
    cputime: 0,
    unit: kernel ? "kernel" : "init.scope",
    ...rest,
  };
}

const sys = (name: string) => ({ user: "root", unit: `system.slice/${name}` });
const usr = (slice: string, name: string) => ({ unit: `user@1000.service/${slice}/${name}` });
const sess = { unit: "session-2.scope" };
const hup: Proc["handlers"] = { 1: { note: "Reloaded its configuration." } };
const shell = (tty: string, start: number): Opts => ({
  ...sess,
  tty,
  start,
  withParent: true,
  mib: 4.2,
  cwd: "~/github/romeosarkar10x_design/arch_hyprland_mocha_square_rice",
  handlers: {
    2: { note: "Interactive shells ignore SIGINT (it goes to the foreground job)." },
    3: { note: "Interactive shells ignore SIGQUIT." },
    15: { note: "Interactive shells ignore SIGTERM. Use SIGHUP (like closing the tab) or SIGKILL." },
    20: { note: "Interactive shells ignore SIGTSTP." },
  },
});
const job = (o: Opts = {}): Opts => ({ ...sess, withParent: true, ...o });
const helper = (o: Opts): Opts => ({ ...sess, withParent: true, ...o });

export function demoProcs(): Proc[] {
  const k = (pid: number, ppid: number, name: string, cpu = 0, state: ProcState = "I") => p(pid, ppid, name, { kernel: true, user: "root", cpu, state, cmd: `[${name}]` });
  const procs: Proc[] = [
    // ── kernel
    k(2, 0, "kthreadd", 0, "S"),
    k(13, 2, "ksoftirqd/0", 0.1, "S"),
    k(15, 2, "rcu_preempt", 0.2),
    k(17, 2, "migration/0", 0, "S"),
    k(64, 2, "kswapd0", 0, "S"),
    k(98, 2, "kworker/u32:2-events_unbound", 0.3),
    k(141, 2, "irq/158-nvidia", 0.4, "S"),
    k(212, 2, "jbd2/nvme0n1p2-8", 0, "S"),
    k(233, 2, "kworker/3:1H-kblockd", 0.1),

    // ── init + system services
    p(1, 0, "systemd", { user: "root", cmd: "/sbin/init", mib: 9, sharedMib: 7, cpu: 0.1, start: 0, cputime: 14, subreaper: true, unit: "init.scope", icon: "settings",
      handlers: { 1: { note: "Reloaded unit files (daemon-reload)." }, 15: { note: "Re-executed itself, keeping state (daemon-reexec)." }, 10: { note: "Reconnected to D-Bus." } } }),
    p(311, 1, "systemd-journal", { ...sys("systemd-journald.service"), cmd: "/usr/lib/systemd/systemd-journald", mib: 22, sharedMib: 14, cpu: 0.2, write: 120_000, cputime: 6 }),
    p(342, 1, "systemd-udevd", { ...sys("systemd-udevd.service"), cmd: "/usr/lib/systemd/systemd-udevd", mib: 6, cputime: 1, handlers: hup }),
    p(498, 1, "systemd-timesyn", { ...sys("systemd-timesyncd.service"), user: "systemd-timesync", cmd: "/usr/lib/systemd/systemd-timesyncd", mib: 3, threads: 2 }),
    p(512, 1, "systemd-logind", { ...sys("systemd-logind.service"), cmd: "/usr/lib/systemd/systemd-logind", mib: 5 }),
    p(513, 1, "dbus-broker-lau", { ...sys("dbus-broker.service"), user: "dbus", cmd: "/usr/bin/dbus-broker-launch --scope system --audit", mib: 2, handlers: hup }),
    p(514, 513, "dbus-broker", { ...sys("dbus-broker.service"), user: "dbus", cmd: "dbus-broker --log 4 --controller 9 --machine-id 3b1f… --max-bytes 536870912 --audit", mib: 4, cpu: 0.1 }),
    p(530, 1, "NetworkManager", { ...sys("NetworkManager.service"), cmd: "/usr/bin/NetworkManager --no-daemon", mib: 18, threads: 4, cpu: 0.1, handlers: { 1: { note: "Reloaded NetworkManager.conf and DNS settings." } } }),
    p(560, 1, "wpa_supplicant", { ...sys("wpa_supplicant.service"), cmd: "/usr/bin/wpa_supplicant -u -s -O /run/wpa_supplicant", mib: 7 }),
    p(575, 1, "bluetoothd", { ...sys("bluetooth.service"), cmd: "/usr/lib/bluetooth/bluetoothd", mib: 4 }),
    p(590, 1, "polkitd", { ...sys("polkit.service"), user: "polkitd", cmd: "/usr/lib/polkit-1/polkitd --no-debug", mib: 9, threads: 4 }),
    p(602, 1, "sshd", { ...sys("sshd.service"), cmd: "sshd: /usr/bin/sshd -D [listener] 0 of 10-100 startups", mib: 3, handlers: { 1: { note: "Re-read sshd_config and restarted the listener." } } }),
    p(640, 1, "dockerd", { ...sys("docker.service"), cmd: "/usr/bin/dockerd -H fd://", mib: 84, threads: 22, cpu: 0.3, icon: "package", handlers: hup }),
    p(655, 1, "containerd", { ...sys("containerd.service"), cmd: "/usr/bin/containerd", mib: 46, threads: 16, cpu: 0.2 }),
    p(1420, 1, "containerd-shim", { user: "root", unit: "system.slice/docker-7c2e91.scope", cmd: "/usr/bin/containerd-shim-runc-v2 -namespace moby -id 7c2e91… -address /run/containerd/containerd.sock", mib: 9, threads: 10, app: "Container: postgres", icon: "server" }),
    p(1441, 1420, "postgres", { user: "postgres", unit: "system.slice/docker-7c2e91.scope", cmd: "postgres", mib: 38, sharedMib: 140, cpu: 0.4, read: 40_000, cwd: "/var/lib/postgresql/data",
      handlers: {
        1: { note: "Reloaded postgresql.conf and pg_hba.conf." },
        15: { note: "Smart shutdown: waited for clients to disconnect, then exited.", exit: true },
        2: { note: "Fast shutdown: rolled back open transactions and exited.", exit: true },
        3: { note: "Immediate shutdown: exited without a checkpoint; recovery runs on next start.", exit: true },
      } }),
    ...["checkpointer", "background writer", "walwriter", "autovacuum launcher", "logical replication launcher"].map((n, i) =>
      p(1460 + i, 1441, `postgres: ${n}`.slice(0, 15), { user: "postgres", unit: "system.slice/docker-7c2e91.scope", cmd: `postgres: ${n}`, mib: 2 + i, sharedMib: 140, withParent: true, write: n === "walwriter" ? 30_000 : 0 })),
    p(700, 1, "greetd", { ...sys("greetd.service"), cmd: "/usr/bin/greetd", mib: 2 }),

    // ── user manager (subreaper for the user's services)
    p(1050, 1, "systemd", { unit: "user@1000.service/init.scope", cmd: "/usr/lib/systemd/systemd --user", mib: 8, subreaper: true, icon: "settings", handlers: { 1: { note: "Reloaded user unit files." } } }),
    p(1056, 1050, "(sd-pam)", { unit: "user@1000.service/init.scope", cmd: "(sd-pam)", mib: 1 }),
    p(1062, 1050, "pipewire", { ...usr("session.slice", "pipewire.service"), cmd: "/usr/bin/pipewire", mib: 14, threads: 3, cpu: 1.4, nice: -11, icon: "speaker" }),
    p(1063, 1050, "wireplumber", { ...usr("session.slice", "wireplumber.service"), cmd: "/usr/bin/wireplumber", mib: 22, threads: 5, cpu: 0.2, nice: -11, icon: "speaker" }),
    p(1064, 1050, "pipewire-pulse", { ...usr("session.slice", "pipewire-pulse.service"), cmd: "/usr/bin/pipewire-pulse", mib: 9, threads: 3, cpu: 0.6, nice: -11, icon: "speaker" }),
    p(1070, 1050, "dbus-broker-lau", { ...usr("session.slice", "dbus-broker.service"), cmd: "/usr/bin/dbus-broker-launch --scope user", mib: 2 }),
    p(1071, 1070, "dbus-broker", { ...usr("session.slice", "dbus-broker.service"), cmd: "dbus-broker --log 4 --controller 10 --machine-id 3b1f… --max-bytes 100000000000000", mib: 3, cpu: 0.1 }),
    p(1180, 1050, "xdg-desktop-por", { ...usr("session.slice", "xdg-desktop-portal.service"), cmd: "/usr/lib/xdg-desktop-portal", mib: 12, threads: 6 }),
    p(1185, 1050, "xdg-desktop-por", { ...usr("session.slice", "xdg-desktop-portal-hyprland.service"), cmd: "/usr/lib/xdg-desktop-portal-hyprland", mib: 16, threads: 4 }),
    p(1190, 1050, "gvfsd", { ...usr("app.slice", "gvfs-daemon.service"), cmd: "/usr/lib/gvfsd", mib: 7, threads: 3 }),
    p(1250, 1050, "hyprpolkitagent", { ...usr("app.slice", "hyprpolkitagent.service"), cmd: "/usr/lib/hyprpolkitagent", mib: 48, sharedMib: 60, threads: 7, icon: "lock" }),

    // ── the session
    p(1102, 700, "Hyprland", { ...sess, cmd: "Hyprland", mib: 182, sharedMib: 128, threads: 12, cpu: 3.2, nice: -5, app: "Hyprland", icon: "monitor", start: 9, cputime: 412,
      handlers: { 1: { note: "Hyprland ignores SIGHUP." } } }),
    p(1140, 1102, "hyprpaper", { ...sess, cmd: "hyprpaper", mib: 64, sharedMib: 30, withParent: true, app: "Hyprpaper", icon: "image", start: 10 }),
    p(1141, 1102, "waybar", { ...sess, cmd: "waybar", mib: 58, sharedMib: 72, threads: 6, cpu: 0.6, withParent: true, app: "Waybar", icon: "chart", start: 10,
      handlers: { 10: { note: "Toggled bar visibility." }, 12: { note: "Reloaded config.jsonc and style.css." } } }),
    p(1160, 1102, "swaync", { ...sess, cmd: "swaync", mib: 41, sharedMib: 60, threads: 5, withParent: true, app: "Notifications", icon: "bell", start: 10 }),
    p(1161, 1102, "hypridle", { ...sess, cmd: "hypridle", mib: 4, withParent: true, app: "Hypridle", icon: "moon", start: 10 }),
    p(1170, 1102, "wl-paste", { ...sess, cmd: "wl-paste --type text --watch cliphist store", mib: 1.4, withParent: true, app: "Clipboard", icon: "note", start: 10 }),
    p(1171, 1102, "wl-paste", { ...sess, cmd: "wl-paste --type image --watch cliphist store", mib: 1.4, withParent: true, app: "Clipboard", icon: "note", start: 10 }),

    // Ghostty with four tabs.
    p(2010, 1102, "ghostty", { ...sess, cmd: "/usr/bin/ghostty", mib: 148, sharedMib: 96, threads: 9, cpu: 1.1, withParent: true, app: "Ghostty", icon: "ghostty", start: 40, cputime: 96 }),
    p(2031, 2010, "zsh", shell("pts/0", 41)),
    p(2077, 2031, "nvim", job({ tty: "pts/0", start: 80, cmd: "nvim src/hypr/Compositor.tsx", mib: 38, threads: 2, cpu: 0.3, icon: "code",
      handlers: { 2: { note: "Cancelled the pending command; Neovim keeps running." }, 28: { note: "Redrew for the new size." } } })),
    p(2090, 2077, "node", helper({ tty: "pts/0", start: 81, cmd: "node /usr/bin/typescript-language-server --stdio", mib: 96, threads: 11, cpu: 0.4 })),
    p(2091, 2090, "node", helper({ tty: "pts/0", start: 81, cmd: "node …/typescript/lib/tsserver.js --serverMode partialSemantic --useInferredProjectPerProjectRoot", mib: 412, threads: 7, cpu: 1.8, leak: 6 })),
    p(2100, 2077, "lua-language-se", helper({ tty: "pts/0", start: 82, cmd: "lua-language-server", mib: 74, threads: 4 })),
    p(2032, 2010, "zsh", shell("pts/1", 42)),
    p(2140, 2032, "btop", job({ tty: "pts/1", start: 60, cmd: "btop", mib: 6, cpu: 1.6, icon: "chart", handlers: { 28: { note: "Redrew for the new size." } } })),
    p(2033, 2010, "zsh", shell("pts/2", 43)),
    p(3001, 2033, "pnpm", job({ tty: "pts/2", start: 300, cmd: "pnpm storybook", mib: 58, threads: 7, icon: "package" })),
    p(3010, 3001, "node", helper({ tty: "pts/2", start: 301, cmd: "node node_modules/.bin/storybook dev -p 6006", mib: 640, sharedMib: 52, threads: 14, cpu: 4.5, read: 900_000, write: 200_000, leak: 4 })),
    p(3030, 3010, "esbuild", helper({ tty: "pts/2", start: 302, cmd: "node_modules/@esbuild/linux-x64/bin/esbuild --service=0.25.9 --ping", mib: 118, threads: 18, cpu: 0.6 })),
    p(2034, 2010, "zsh", shell("pts/3", 44)),
    p(4412, 2034, "python3", job({ tty: "pts/3", start: 3100, cmd: "python3 scrape.py --pages 50000 --out data/", mib: 1240, sharedMib: 18, threads: 3, cpu: 96, base: 96, leak: 220, write: 600_000, icon: "code",
      handlers: {
        15: { note: "Caught by its signal handler: printed “ignoring SIGTERM, still scraping” and kept going. Try SIGINT, then SIGKILL." },
      } })),
    p(2035, 2010, "zsh", shell("pts/4", 45)),
    p(4520, 2035, "less", job({ tty: "pts/4", start: 3300, cmd: "less /var/log/pacman.log", mib: 2.2, state: "T" })),

    // Firefox and its content processes.
    p(2200, 1102, "firefox", { ...sess, cmd: "/usr/lib/firefox/firefox", mib: 520, sharedMib: 180, threads: 98, cpu: 3.8, withParent: true, app: "Firefox", icon: "firefox", start: 120, cputime: 1880, read: 300_000 }),
    p(2215, 2200, "Socket Process", helper({ cmd: "/usr/lib/firefox/firefox -contentproc -isForBrowser … socket", mib: 22, threads: 6 })),
    p(2230, 2200, "Privileged Cont", helper({ cmd: "/usr/lib/firefox/firefox -contentproc -isForBrowser … tab", mib: 88, threads: 24 })),
    p(2241, 2200, "RDD Process", helper({ cmd: "/usr/lib/firefox/firefox -contentproc … rdd", mib: 34, threads: 7, cpu: 0.9 })),
    p(2250, 2200, "Utility Process", helper({ cmd: "/usr/lib/firefox/firefox -contentproc … utility", mib: 18, threads: 5 })),
    p(2255, 2200, "GPU Process", helper({ cmd: "/usr/lib/firefox/firefox -contentproc … gpu", mib: 140, sharedMib: 120, threads: 20, cpu: 2.1 })),
    ...[
      ["wiki.hypr.land", 142, 0.6],
      ["github.com", 236, 0.9],
      ["archlinux.org/packages", 74, 0.1],
      ["claude.ai", 318, 1.2],
      ["reddit.com/r/unixporn", 288, 0.8],
      ["localhost:6006", 402, 2.6],
    ].map(([site, mib, cpu], i) => p(2260 + i, 2200, "Web Content", helper({ cmd: `/usr/lib/firefox/firefox -contentproc -isForBrowser … tab  # ${site}`, mib: mib as number, sharedMib: 92, threads: 22, cpu: cpu as number }))),
    p(2270, 2200, "Isolated Web Co", helper({ cmd: "/usr/lib/firefox/firefox -contentproc -isForBrowser … tab  # youtube.com (playing)", mib: 860, sharedMib: 92, threads: 31, cpu: 11, read: 400_000, leak: 30 })),
    p(2271, 2200, "Isolated Servic", helper({ cmd: "/usr/lib/firefox/firefox -contentproc … tab  # service worker", mib: 44, sharedMib: 92, threads: 18 })),

    // Dolphin.
    p(2400, 1102, "dolphin", { ...sess, cmd: "/usr/bin/dolphin", mib: 96, sharedMib: 110, threads: 8, withParent: true, app: "Dolphin", icon: "folder", start: 900 }),
    p(2410, 2400, "kioworker", helper({ cmd: "/usr/lib/kf6/kioworker /usr/lib/qt6/plugins/kf6/kio/file.so file local:/run/user/1000/dolphinXa.socket", mib: 12, threads: 3 })),

    // Electron apps.
    ...electron(2500, "spotify", "Spotify", "spotify", 210, 1.9),
    ...electron(2600, "Discord", "Discord", "chat", 340, 1.2),

    // Steam, with a zombie it never reaped.
    p(2700, 1102, "steam", { ...sess, cmd: "/home/romeo/.local/share/Steam/ubuntu12_32/steam -srt-logger-opened", mib: 280, sharedMib: 90, threads: 61, cpu: 0.7, withParent: true, app: "Steam", icon: "steam", start: 1500 }),
    p(2710, 2700, "steamwebhelper", helper({ cmd: "./steamwebhelper -lang=en_US -cachedir=… -steampid=2700", mib: 160, threads: 28, cpu: 0.4 })),
    p(2711, 2710, "steamwebhelper", helper({ cmd: "./steamwebhelper --type=zygote", mib: 30, threads: 2 })),
    p(2712, 2710, "steamwebhelper", helper({ cmd: "./steamwebhelper --type=gpu-process", mib: 120, threads: 12, cpu: 0.5 })),
    p(2713, 2711, "steamwebhelper", helper({ cmd: "./steamwebhelper --type=renderer", mib: 210, threads: 18, cpu: 0.3 })),
    p(2750, 2700, "steam-runtime-l", { ...sess, cmd: "", state: "Z", start: 1510, withParent: false }),
  ];
  // Zombies hold nothing but a process-table slot.
  return procs.map((x) => (x.state === "Z" ? { ...x, uss: 0, shared: 0, pss: 0, vsz: 0, threads: 1 } : x));
}

function electron(pid: number, name: string, app: string, icon: string, mib: number, cpu: number): Proc[] {
  const bin = name === "Discord" ? "/opt/discord/Discord" : "/opt/spotify/spotify";
  return [
    p(pid, 1102, name, { ...sess, cmd: `${bin} --ozone-platform=wayland`, mib, sharedMib: 110, threads: 40, cpu, withParent: true, app, icon, start: 600 + pid / 10 }),
    p(pid + 10, pid, name, helper({ cmd: `${bin} --type=zygote --no-zygote-sandbox`, mib: 28, threads: 2 })),
    p(pid + 11, pid + 10, name, helper({ cmd: `${bin} --type=renderer --enable-features=WaylandWindowDecorations`, mib: mib * 1.3, threads: 20, cpu: cpu * 0.7 })),
    p(pid + 20, pid, name, helper({ cmd: `${bin} --type=gpu-process --ozone-platform=wayland`, mib: 130, sharedMib: 110, threads: 12, cpu: cpu * 0.5 })),
    p(pid + 30, pid, name, helper({ cmd: `${bin} --type=utility --utility-sub-type=network.mojom.NetworkService`, mib: 36, threads: 9 })),
  ];
}

export const MACHINE: Machine = {
  cpuModel: "AMD Ryzen 7 7840HS",
  threads: 16,
  ghz: 3.8,
  memTotal: 31.2 * 1024 * 1024,
  swapTotal: 8 * 1024 * 1024,
  kernelMem: 1.4 * 1024 * 1024,
  cached: 7.6 * 1024 * 1024,
  buffers: 0.4 * 1024 * 1024,
  uptime: 3 * 3600 + 42 * 60 + 10,
  hostname: "archbox",
  kernel: "7.2.9-arch1-1",
};

const fromUnit = (procs: Proc[], u: Pick<Unit, "name" | "scope">) => procs.filter((x) => (u.scope === "system" ? x.unit === `system.slice/${u.name}` : x.unit.startsWith("user@") && x.unit.endsWith(`/${u.name}`)));

/** systemd units, with templates captured from the snapshot so stop / start round-trips. */
export function demoUnits(procs = demoProcs()): Unit[] {
  const s = (name: string, description: string, o: Partial<Unit> = {}): Unit => ({ name, scope: "system", description, enabled: true, template: fromUnit(procs, { name, scope: "system" }), ...o });
  const u = (name: string, description: string, o: Partial<Unit> = {}): Unit => ({ name, scope: "user", description, enabled: true, template: fromUnit(procs, { name, scope: "user" }), ...o });
  return [
    s("systemd-journald.service", "Journal Service"),
    s("systemd-udevd.service", "Rule-based Manager for Device Events and Files", { reload: true }),
    s("systemd-logind.service", "User Login Management"),
    s("systemd-timesyncd.service", "Network Time Synchronization"),
    s("dbus-broker.service", "D-Bus System Message Bus", { reload: true }),
    s("NetworkManager.service", "Network Manager", { reload: true }),
    s("wpa_supplicant.service", "WPA supplicant"),
    s("bluetooth.service", "Bluetooth service"),
    s("polkit.service", "Authorization Manager"),
    s("sshd.service", "OpenSSH Daemon", { reload: true }),
    s("docker.service", "Docker Application Container Engine", { reload: true }),
    s("containerd.service", "containerd container runtime"),
    s("greetd.service", "Greeter daemon"),
    s("cronie.service", "Periodic Command Scheduler", {
      enabled: false,
      template: [p(9001, 1, "crond", { user: "root", unit: "system.slice/cronie.service", cmd: "/usr/bin/crond -n", mib: 2 })],
    }),
    s("cups.service", "CUPS Scheduler", { result: "failed", failure: "Main process exited, code=exited, status=1/FAILURE — Unable to open listen socket for address [::1]:631", template: [] }),
    s("reflector.service", "Refresh Pacman mirrorlist with Reflector", { oneshot: true, result: "exited", template: [] }),
    u("pipewire.service", "PipeWire Multimedia Service"),
    u("wireplumber.service", "Multimedia Service Session Manager"),
    u("pipewire-pulse.service", "PipeWire PulseAudio"),
    u("dbus-broker.service", "D-Bus User Message Bus", { reload: true }),
    u("xdg-desktop-portal.service", "Portal service"),
    u("xdg-desktop-portal-hyprland.service", "Portal service (Hyprland implementation)"),
    u("gvfs-daemon.service", "Virtual filesystem service"),
    u("hyprpolkitagent.service", "Hyprland Polkit Authentication Agent"),
    u("syncthing.service", "Syncthing - Open Source Continuous File Synchronization", {
      enabled: false,
      template: [
        p(9101, 1050, "syncthing", { unit: "user@1000.service/app.slice/syncthing.service", cmd: "/usr/bin/syncthing serve --no-browser --no-restart --logflags=0", mib: 34, threads: 12, icon: "swap" }),
        p(9102, 9101, "syncthing", { unit: "user@1000.service/app.slice/syncthing.service", cmd: "/usr/bin/syncthing serve --no-browser --no-restart --logflags=0", mib: 72, threads: 16, cpu: 0.4, withParent: true }),
      ],
    }),
  ];
}

/** Autostart entries: hyprland.lua's on-start exec_cmd lines plus enabled user units. */
export interface StartupEntry {
  name: string;
  command: string;
  source: "hyprland.lua" | "systemd --user";
  /** comm to look for in the process table; none for one-shots. */
  match?: string;
  enabled: boolean;
}

export const STARTUP: StartupEntry[] = [
  { name: "Cursor theme", command: "hyprctl setcursor catppuccin-mocha-pink-cursors 32", source: "hyprland.lua", enabled: true },
  { name: "hyprpaper", command: "hyprpaper", source: "hyprland.lua", match: "hyprpaper", enabled: true },
  { name: "Waybar", command: "waybar", source: "hyprland.lua", match: "waybar", enabled: true },
  { name: "Network applet", command: "nm-applet", source: "hyprland.lua", match: "nm-applet", enabled: false },
];
