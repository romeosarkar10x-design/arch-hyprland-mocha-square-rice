// Simulated system for the live panels: a Ryzen 9 9900X, an RTX 3090 Ti and 30.5 GiB of RAM.
import { useEffect, useState } from "react";
import type { IconName } from "./icons";

export interface CpuStats {
  model: string;
  /** Total load, 0-100. */
  usage: number;
  /** Per-thread load, 0-100. */
  cores: number[];
  /** °C */
  temp: number;
  /** Package power in W; null when RAPL is locked. */
  watts: number | null;
  mhz: number;
  maxMhz: number;
  history: number[];
}

export interface GpuStats {
  name: string;
  usage: number;
  temp: number;
  /** W */
  power: number;
  powerLimit: number;
  /** MiB */
  vramUsed: number;
  vramTotal: number;
  /** Fan %, 0-100. */
  fan: number;
  /** MHz */
  clock: number;
  maxClock: number;
  history: number[];
  powerHistory: number[];
}

export interface MemProcess {
  name: string;
  icon: IconName;
  /** Bytes. */
  pss: number;
}

/** Sizes in bytes. */
export interface MemStats {
  total: number;
  used: number;
  cached: number;
  swapTotal: number;
  swapUsed: number;
  top: MemProcess[];
  /** Used %, 0-100. */
  history: number[];
}

/** Rates in bytes/s, totals in bytes. */
export interface NetStats {
  iface: string;
  ip: string;
  gateway: string;
  dns: string;
  rx: number;
  tx: number;
  rxTotal: number;
  txTotal: number;
  rxHistory: number[];
  txHistory: number[];
}

export interface SystemStats {
  cpu: CpuStats;
  gpu: GpuStats;
  mem: MemStats;
  net: NetStats;
}

const GiB = 1024 ** 3;
const HISTORY = 60;

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const walk = (r: () => number, v: number, lo: number, hi: number, step: number) => Math.min(hi, Math.max(lo, v + (r() - 0.5) * 2 * step));

const push = (h: number[], v: number) => (h.length >= HISTORY ? [...h.slice(1), v] : [...h, v]);

function seedHistory(r: () => number, n: number, start: number, lo: number, hi: number, step: number) {
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < n; i++) {
    v = walk(r, v, lo, hi, step);
    out.push(v);
  }
  return out;
}

/** A deterministic starting state with a full minute of history. */
export function initialStats(seed = 7): SystemStats {
  const r = rng(seed);
  const cpuHist = seedHistory(r, HISTORY, 18, 4, 72, 9);
  const gpuHist = seedHistory(r, HISTORY, 30, 2, 96, 12);
  const powHist = gpuHist.map((u) => 38 + u * 3.6 + r() * 12);
  const rxHist = seedHistory(r, HISTORY, 24e5, 0, 11e6, 16e5);
  const txHist = seedHistory(r, HISTORY, 3e5, 0, 18e5, 25e4);
  const usage = cpuHist[cpuHist.length - 1]!;
  return {
    cpu: {
      model: "AMD Ryzen 9 9900X 12-Core",
      usage,
      cores: Array.from({ length: 12 }, (_, i) => Math.min(100, Math.max(0, usage + (r() - 0.4) * 50 + (i === 3 ? 40 : 0)))),
      temp: 52,
      watts: 61.4,
      mhz: 4620,
      maxMhz: 5662,
      history: cpuHist,
    },
    gpu: {
      name: "NVIDIA GeForce RTX 3090 Ti",
      usage: gpuHist[gpuHist.length - 1]!,
      temp: 58,
      power: powHist[powHist.length - 1]!,
      powerLimit: 450,
      vramUsed: 7342,
      vramTotal: 24564,
      fan: 41,
      clock: 1785,
      maxClock: 2100,
      history: gpuHist,
      powerHistory: powHist,
    },
    mem: {
      total: 30.5 * GiB,
      used: 9.4 * GiB,
      cached: 4.6 * GiB,
      swapTotal: 8 * GiB,
      swapUsed: 0.3 * GiB,
      top: [
        { name: "google-chrome", icon: "chrome", pss: 2.84 * GiB },
        { name: "code", icon: "vscode", pss: 1.21 * GiB },
        { name: "discord", icon: "chat", pss: 0.62 * GiB },
        { name: "ghostty", icon: "ghostty", pss: 0.31 * GiB },
        { name: "spotify", icon: "spotify", pss: 0.28 * GiB },
        { name: "Hyprland", icon: "monitor", pss: 0.19 * GiB },
      ],
      history: seedHistory(r, HISTORY, 30, 26, 36, 1),
    },
    net: {
      iface: "enp8s0",
      ip: "192.168.1.42/24",
      gateway: "192.168.1.1",
      dns: "1.1.1.1",
      rx: rxHist[rxHist.length - 1]!,
      tx: txHist[txHist.length - 1]!,
      rxTotal: 18.4 * GiB,
      txTotal: 2.1 * GiB,
      rxHistory: rxHist,
      txHistory: txHist,
    },
  };
}

/** One second of simulated activity. */
export function tickStats(s: SystemStats, r: () => number = Math.random): SystemStats {
  const usage = walk(r, s.cpu.usage, 3, 97, 10);
  const gpuUsage = walk(r, s.gpu.usage, 1, 99, 14);
  const power = Math.min(s.gpu.powerLimit, 38 + gpuUsage * 3.6 + r() * 14);
  const rx = Math.max(0, walk(r, s.net.rx, 0, 12e6, 18e5));
  const tx = Math.max(0, walk(r, s.net.tx, 0, 2e6, 28e4));
  const used = walk(r, s.mem.used / GiB, 7, 26, 0.35) * GiB;
  return {
    cpu: {
      ...s.cpu,
      usage,
      cores: s.cpu.cores.map((c) => Math.min(100, Math.max(0, c * 0.4 + (usage + (r() - 0.45) * 55) * 0.6))),
      temp: walk(r, 40 + usage * 0.45, 38, 92, 1.2),
      watts: s.cpu.watts == null ? null : 28 + usage * 1.15 + r() * 6,
      mhz: Math.round(3800 + usage * 17 + r() * 120),
      history: push(s.cpu.history, usage),
    },
    gpu: {
      ...s.gpu,
      usage: gpuUsage,
      temp: walk(r, 38 + gpuUsage * 0.42, 34, 88, 1.5),
      power,
      fan: Math.round(Math.max(30, gpuUsage * 0.8)),
      clock: Math.round(210 + gpuUsage * 19 + r() * 40),
      vramUsed: Math.round(walk(r, s.gpu.vramUsed, 2000, 22000, 180)),
      history: push(s.gpu.history, gpuUsage),
      powerHistory: push(s.gpu.powerHistory, power),
    },
    mem: {
      ...s.mem,
      used,
      history: push(s.mem.history, (used / s.mem.total) * 100),
    },
    net: {
      ...s.net,
      rx,
      tx,
      rxTotal: s.net.rxTotal + rx,
      txTotal: s.net.txTotal + tx,
      rxHistory: push(s.net.rxHistory, rx),
      txHistory: push(s.net.txHistory, tx),
    },
  };
}

/** The simulated system, ticking once a second unless paused. */
export function useSystemStats(paused = false) {
  const [s, setS] = useState(initialStats);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setS((p) => tickStats(p)), 1000);
    return () => clearInterval(id);
  }, [paused]);
  return s;
}

/** A fake audio spectrum (0-100 per bar), animated at ~30 fps while playing. */
export function useSpectrum(bars = 48, playing = true) {
  const [v, setV] = useState(() => shape(bars, 0));
  useEffect(() => {
    if (!playing) {
      setV(Array<number>(bars).fill(0));
      return;
    }
    if (typeof requestAnimationFrame === "undefined") return;
    let id = 0;
    let last = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      if (t - last > 33) {
        last = t;
        setV(shape(bars, (t - t0) / 1000));
      }
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [bars, playing]);
  return v;
}

function shape(n: number, t: number) {
  const beat = Math.pow(Math.max(0, Math.cos((((t * 1000) % 470) / 470) * Math.PI)), 6);
  return Array.from({ length: n }, (_, i) => {
    const x = i / (n - 1);
    const base = 78 * Math.exp(-x * 2.6) + 18;
    const wob = 22 * Math.sin(t * 3.1 + i * 0.55) * Math.sin(t * 1.7 + i * 0.21);
    const hit = beat * 30 * Math.exp(-x * 5);
    const shimmer = x > 0.55 ? 14 * Math.abs(Math.sin(t * 7 + i)) : 0;
    return Math.max(2, Math.min(100, base + wob + hit + shimmer - x * 18));
  });
}
