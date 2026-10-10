import { useState, type CSSProperties, type ReactNode } from "react";
import { CoreGrid, Graph, Icon, Sparkline, StackBar, cx, type GraphSeries } from "../ui";
import type { Ask } from "./dialogs";
import { MACHINE } from "./demo";
import { fmtCpu, fmtDuration, fmtKiB, fmtRate, summarise, type Proc } from "./procs";
import type { TM } from "./store";
import { link } from "./styles";

type Device = "cpu" | "mem" | "swap" | "disk" | "net" | "gpu";

const GiB = 1024 * 1024;

const cols = "grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-5 [&>div]:flex [&>div]:flex-col [&>div]:gap-2.5";

export function PerformancePage({ tm, ask, device: initial = "cpu" }: { tm: TM; ask: Ask; device?: Device }) {
  const [dev, setDev] = useState<Device>(initial);
  const sum = summarise(tm.procs, MACHINE, tm.load);
  const h = tm.hist;
  const last = (xs: number[]) => xs.at(-1) ?? 0;
  const apps = tm.procs.reduce((n, p) => n + p.pss, 0);
  const free = MACHINE.memTotal - sum.memUsed - MACHINE.cached - MACHINE.buffers;
  const ghz = (MACHINE.ghz * (0.72 + last(h.cpu) / 180) + (tm.uptime % 7) / 40).toFixed(2);

  const devices: { id: Device; label: string; sub: string; data: number[]; max?: number; accent: string }[] = [
    { id: "cpu", label: "CPU", sub: `${Math.round(last(h.cpu))}% · ${ghz} GHz`, data: h.cpu, max: 100, accent: "sky" },
    { id: "mem", label: "Memory", sub: `${(sum.memUsed / GiB).toFixed(1)} / ${(MACHINE.memTotal / GiB).toFixed(1)} GiB (${Math.round(last(h.mem))}%)`, data: h.mem, max: 100, accent: "mauve" },
    { id: "swap", label: "Swap (zram)", sub: `${fmtKiB(sum.swapUsed)} / ${fmtKiB(MACHINE.swapTotal)}`, data: h.swap, max: 100, accent: "peach" },
    { id: "disk", label: "Disk 0 (nvme0n1)", sub: `R ${fmtRate(last(h.read))} · W ${fmtRate(last(h.write))}`, data: h.read.map((r, i) => r + (h.write[i] ?? 0)), accent: "green" },
    { id: "net", label: "Wi-Fi (wlan0)", sub: `↓ ${fmtRate(last(h.rx))} · ↑ ${fmtRate(last(h.tx))}`, data: h.rx, accent: "sapphire" },
    { id: "gpu", label: "GPU 0 (Radeon 780M)", sub: `${Math.round(last(h.gpu))}%`, data: h.gpu, max: 100, accent: "yellow" },
  ];

  const top = (by: (p: Proc) => number, fmt: (p: Proc) => string, title: string) => (
    <section data-component="TopProcesses" className="flex flex-col gap-2">
      <h4 className="caps m-0">{title}</h4>
      <ol className="m-0 flex list-none flex-col gap-[5px] p-0">
        {[...tm.procs].sort((a, b) => by(b) - by(a)).slice(0, 6).map((p, i) => (
          <li key={p.pid} className="flex items-center gap-2 tabular-nums">
            <span className="w-3.5 text-overlay0">{i + 1}</span>
            <button type="button" className={link} onClick={() => ask.goto(p.pid)}>
              {p.name}
            </button>
            <span className="text-overlay1">{p.pid}</span>
            <span className="flex-1" />
            <b>{fmt(p)}</b>
          </li>
        ))}
      </ol>
    </section>
  );

  const stats = (items: [string, ReactNode][]) => (
    <dl className="m-0 grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-x-[18px] gap-y-2.5">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="text-[11px] text-overlay1">{k}</dt>
          <dd className="m-0 text-[15px] font-bold tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );

  const graph = (series: GraphSeries[], max: number | undefined, format: (v: number) => string, label: string) => (
    <div className="flex flex-col gap-1 p-2 text-[11.5px] shadow-[0_0_0_1px_var(--hx-surface0)]">
      <span className="text-overlay1">{label}</span>
      <Graph series={series} max={max} height={220} gridLines={4} format={format} />
    </div>
  );

  const d = devices.find((x) => x.id === dev)!;
  return (
    <div data-component="PerformancePage" className="grid min-h-0 flex-1 grid-cols-[250px_minmax(0,1fr)]">
      <nav className="flex flex-col gap-0.5 overflow-auto border-r border-surface0 px-1.5 py-2" aria-label="Devices">
        {devices.map((x) => (
          <button
            key={x.id}
            type="button"
            className={cx(
              "unbutton flex cursor-pointer items-center gap-2.5 p-2 text-left text-(--rx-acc) hover:bg-surface0",
              x.id === dev && "bg-surface0 shadow-[inset_2px_0_0_var(--rx-acc)]",
            )}
            onClick={() => setDev(x.id)}
            style={{ "--rx-acc": `var(--hx-${x.accent})` } as CSSProperties}
          >
            <Sparkline data={x.data} max={x.max} bars={24} height={30} className="w-16 flex-none" />
            <span className="flex min-w-0 flex-col text-text">
              <b>{x.label}</b>
              <small className="truncate text-[11px] text-overlay1">{x.sub}</small>
            </span>
          </button>
        ))}
      </nav>
      <div
        data-component="DevicePane"
        className="flex flex-col gap-3.5 overflow-auto px-5 py-4 [&>header]:flex [&>header]:items-baseline [&>header]:gap-3.5 [&_h3]:m-0 [&_h3]:text-[22px] [&_h3]:text-(--rx-acc)"
        style={{ "--rx-acc": `var(--hx-${d.accent})` } as CSSProperties}
      >
        {dev === "cpu" && (
          <>
            <header>
              <h3>CPU</h3>
              <span className="text-overlay1">{MACHINE.cpuModel} · 8 cores / 16 threads</span>
            </header>
            {graph([{ label: "total", data: h.cpu, accent: "sky" }], 100, (v) => `${Math.round(v)}%`, "Utilisation over 60 s")}
            <div className={cols}>
              <div>
                <h4 className="caps">Per thread</h4>
                <CoreGrid cores={h.cores} columns={8} accent="sky" />
                {stats([
                  ["Utilisation", `${Math.round(sum.cpu)}%`],
                  ["Speed", `${ghz} GHz`],
                  ["Processes", sum.tasks],
                  ["Threads", sum.threads],
                  ["Running", sum.running],
                  ["Load average", tm.load.map((l) => l.toFixed(2)).join("  ")],
                  ["Up time", fmtDuration(tm.uptime)],
                  ["Kernel", MACHINE.kernel],
                ])}
              </div>
              {top((p) => p.cpu, (p) => `${fmtCpu(p.cpu / MACHINE.threads)}%`, "Top CPU")}
            </div>
          </>
        )}
        {dev === "mem" && (
          <>
            <header>
              <h3>Memory</h3>
              <span className="text-overlay1">{(MACHINE.memTotal / GiB).toFixed(1)} GiB LPDDR5-6400</span>
            </header>
            {graph([{ label: "used", data: h.mem, accent: "mauve" }], 100, (v) => `${Math.round(v)}%`, "Memory in use")}
            <div className={cols}>
              <div>
                <h4 className="caps">Composition</h4>
                <StackBar
                  total={MACHINE.memTotal}
                  format={fmtKiB}
                  segments={[
                    { label: "processes (PSS)", value: apps, accent: "mauve" },
                    { label: "kernel / slab", value: MACHINE.kernelMem, accent: "red" },
                    { label: "page cache", value: MACHINE.cached, accent: "blue" },
                    { label: "buffers", value: MACHINE.buffers, accent: "teal" },
                  ]}
                />
                {stats([
                  ["In use", fmtKiB(sum.memUsed)],
                  ["Available", fmtKiB(free + MACHINE.cached)],
                  ["Cached", fmtKiB(MACHINE.cached)],
                  ["Free", fmtKiB(free)],
                  ["Committed", fmtKiB(tm.procs.reduce((n, p) => n + p.vsz, 0) / 6)],
                  ["Swap used", fmtKiB(sum.swapUsed)],
                ])}
              </div>
              {top((p) => p.pss, (p) => fmtKiB(p.pss), "Top memory (PSS)")}
            </div>
          </>
        )}
        {dev === "swap" && (
          <>
            <header>
              <h3>Swap</h3>
              <span className="text-overlay1">/dev/zram0 · zstd · {fmtKiB(MACHINE.swapTotal)}</span>
            </header>
            {graph([{ label: "swap", data: h.swap, accent: "peach" }], 100, (v) => `${v.toFixed(1)}%`, "Swap in use")}
            {stats([
              ["Used", fmtKiB(sum.swapUsed)],
              ["Total", fmtKiB(MACHINE.swapTotal)],
              ["Swappiness", "180"],
              ["Priority", "100"],
            ])}
            <p className="text-overlay1">Compressed swap in RAM. Nothing has been pushed out yet — memory pressure is low.</p>
          </>
        )}
        {dev === "disk" && (
          <>
            <header>
              <h3>Disk 0</h3>
              <span className="text-overlay1">Samsung 990 PRO 1 TB · nvme0n1 · btrfs</span>
            </header>
            {graph(
              [
                { label: "read", data: h.read, accent: "green" },
                { label: "write", data: h.write, accent: "peach", mirror: true },
              ],
              undefined,
              fmtRate,
              "Read (up) / write (down)",
            )}
            <div className={cols}>
              {stats([
                ["Read", fmtRate(last(h.read))],
                ["Write", fmtRate(last(h.write))],
                ["Active time", `${Math.min(100, Math.round(last(h.read) / 2e5))}%`],
                ["Used", "412 / 931 GiB"],
              ])}
              {top((p) => p.read + p.write, (p) => fmtRate(p.read + p.write), "Top disk I/O")}
            </div>
          </>
        )}
        {dev === "net" && (
          <>
            <header>
              <h3>Wi-Fi</h3>
              <span className="text-overlay1">wlan0 · MediaTek MT7922 · 5 GHz · 1.2 Gb/s</span>
            </header>
            {graph(
              [
                { label: "receive", data: h.rx, accent: "sapphire" },
                { label: "send", data: h.tx, accent: "pink", mirror: true },
              ],
              undefined,
              fmtRate,
              "Receive (up) / send (down)",
            )}
            {stats([
              ["Receive", fmtRate(last(h.rx))],
              ["Send", fmtRate(last(h.tx))],
              ["SSID", "archnet"],
              ["IPv4", "192.168.1.42"],
              ["Signal", "-48 dBm"],
            ])}
          </>
        )}
        {dev === "gpu" && (
          <>
            <header>
              <h3>GPU 0</h3>
              <span className="text-overlay1">AMD Radeon 780M (amdgpu) · shared memory</span>
            </header>
            {graph([{ label: "3D", data: h.gpu, accent: "yellow" }], 100, (v) => `${Math.round(v)}%`, "Utilisation")}
            {stats([
              ["Utilisation", `${Math.round(last(h.gpu))}%`],
              ["VRAM (GTT)", "1.6 / 8.0 GiB"],
              ["Temperature", "52 °C"],
              ["Clients", "Hyprland, firefox, spotify, Discord"],
            ])}
          </>
        )}
        <footer className="mt-auto flex items-center gap-1.5 text-[11px] text-overlay1">
          <Icon name="info" size={12} /> Click a process in a top list to jump to it.
        </footer>
      </div>
    </div>
  );
}
