// Generated Arch Linux wallpapers. Each one is a 1920×1080 SVG built from code (no
// bitmaps, no third-party art), so they scale to any monitor and stay a few KB. Each has
// its own fixed colours on purpose: they are the input to the wallpaper -> theme
// extractor, which then rethemes the whole UI to match.
//
// The Arch logo path is mdiArch from Material Design Icons (Apache-2.0), 24×24 viewBox.
// "Arch Linux" and the logo are trademarks of their owners; this is for personal rices.

export const ARCH_PATH =
  "M12,2C11.11,4.18 10.57,5.61 9.58,7.73C10.19,8.37 10.93,9.12 12.14,9.97C10.84,9.43 9.95,8.9 9.29,8.34C8,11 6.03,14.75 2,22C5.17,20.17 7.63,19.04 9.92,18.61C9.82,18.19 9.76,17.73 9.77,17.25V17.15C9.82,15.12 10.88,13.56 12.13,13.67C13.38,13.77 14.35,15.5 14.3,17.54C14.29,17.92 14.25,18.29 14.18,18.63C16.44,19.07 18.87,20.19 22,22C21.38,20.86 20.83,19.84 20.31,18.87C19.5,18.23 18.61,17.39 16.85,16.5C18.06,16.8 18.93,17.16 19.61,17.57C14.26,7.62 13.83,6.3 12,2Z";

export interface WallpaperDef {
  id: string;
  name: string;
  description: string;
  svg: string;
  /** data: URL, usable as an <img> src or CSS background. */
  url: string;
}

const W = 1920, H = 1080;

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => +n.toFixed(1);

/** The Arch logo centred at (cx, cy), `size` px tall. */
function logo(cx: number, cy: number, size: number, attrs: string): string {
  const s = size / 20; // the glyph spans y 2..22 in its 24 box
  return `<path d="${ARCH_PATH}" transform="translate(${f(cx - 12 * s)} ${f(cy - 12 * s)}) scale(${f(s * 100) / 100})" ${attrs}/>`;
}

function stars(rand: () => number, count: number, maxY: number, colour = "#fff"): string {
  let out = "";
  for (let i = 0; i < count; i++) {
    const r = rand() ** 3 * 1.8 + 0.4;
    out += `<circle cx="${f(rand() * W)}" cy="${f(rand() * maxY)}" r="${f(r)}" fill="${colour}" opacity="${f(0.25 + rand() * 0.75)}"/>`;
  }
  return out;
}

/** A closed ridge line: random-walk silhouette from x=0 to x=W, filled down to the bottom. */
function ridge(rand: () => number, y: number, amp: number, step: number, fill: string, jag = 1): string {
  let d = `M0 ${H} L0 ${f(y)}`;
  let cur = y;
  for (let x = step; x <= W + step; x += step) {
    cur = Math.min(H - 40, Math.max(y - amp, cur + (rand() - 0.5) * amp * jag));
    d += ` L${x} ${f(cur)}`;
  }
  return `<path d="${d} L${W} ${H} Z" fill="${fill}"/>`;
}

const svg = (defs: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>`;

const glow = (id: string, sd: number) =>
  `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

// ───────── wallpapers ─────────

function nebula(): string {
  const rand = rng(7);
  return svg(
    `<radialGradient id="bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#161233"/><stop offset="1" stop-color="#05040d"/></radialGradient>
     ${glow("blur", 90)}${glow("soft", 14)}
     <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9b8ff"/><stop offset="1" stop-color="#7aa7ff"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>
     <g filter="url(#blur)" opacity=".85">
       <ellipse cx="560" cy="640" rx="520" ry="300" fill="#6b3fd4"/>
       <ellipse cx="1340" cy="380" rx="460" ry="260" fill="#2c64d8"/>
       <ellipse cx="1100" cy="760" rx="300" ry="180" fill="#d23c9a"/>
       <ellipse cx="860" cy="430" rx="220" ry="150" fill="#3fb8d6" opacity=".6"/>
     </g>
     ${stars(rand, 260, H)}
     ${logo(960, 540, 300, `fill="#a58bff" filter="url(#soft)" opacity=".7"`)}
     ${logo(960, 540, 300, `fill="url(#mark)"`)}`,
  );
}

function outrun(): string {
  const rand = rng(11);
  const horizon = 690;
  let grid = "";
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    const y = horizon + (H - horizon) * t ** 2.2;
    grid += `<line x1="0" y1="${f(y)}" x2="${W}" y2="${f(y)}" stroke="#ff4fa3" stroke-width="${f(1 + t * 3)}" opacity="${f(0.35 + t * 0.6)}"/>`;
  }
  for (let i = -24; i <= 24; i++) {
    grid += `<line x1="${960 + i * 18}" y1="${horizon}" x2="${960 + i * 220}" y2="${H}" stroke="#ff4fa3" stroke-width="2" opacity=".7"/>`;
  }
  let stripes = "";
  for (let i = 0; i < 7; i++) {
    const y = 520 + i * 26 + i * i * 2;
    stripes += `<rect x="600" y="${y}" width="720" height="${4 + i * 2.4}" fill="#000"/>`;
  }
  return svg(
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0221"/><stop offset=".55" stop-color="#3b0a54"/><stop offset="1" stop-color="#ff6a5c"/></linearGradient>
     <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset=".6" stop-color="#ff7b54"/><stop offset="1" stop-color="#ff2e88"/></linearGradient>
     <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b0433"/><stop offset="1" stop-color="#090014"/></linearGradient>
     <mask id="cut"><rect width="${W}" height="${H}" fill="#fff"/>${stripes}</mask>
     ${glow("bloom", 30)}`,
    `<rect width="${W}" height="${horizon}" fill="url(#sky)"/>
     ${stars(rand, 120, 420)}
     <circle cx="960" cy="520" r="280" fill="#ff5f8f" filter="url(#bloom)" opacity=".6"/>
     <g mask="url(#cut)"><circle cx="960" cy="520" r="260" fill="url(#sun)"/></g>
     ${logo(960, 500, 190, `fill="#2a0638" opacity=".85"`)}
     <path d="M0 ${horizon} L180 600 L330 650 L520 540 L700 640 L760 ${horizon} Z" fill="#14022b" stroke="#2de2e6" stroke-width="2"/>
     <path d="M1160 ${horizon} L1300 590 L1460 650 L1640 520 L1800 620 L${W} 580 L${W} ${horizon} Z" fill="#14022b" stroke="#2de2e6" stroke-width="2"/>
     <rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#floor)"/>
     ${grid}
     <rect y="${horizon - 2}" width="${W}" height="4" fill="#2de2e6" opacity=".9"/>`,
  );
}

function contour(): string {
  const rand = rng(23);
  const centres = [
    { x: 520, y: 420, n: 26 },
    { x: 1420, y: 720, n: 22 },
  ];
  let lines = "";
  for (const c of centres) {
    const phase = Array.from({ length: 4 }, () => rand() * Math.PI * 2);
    for (let i = 1; i <= c.n; i++) {
      const r = i * 34;
      let d = "";
      for (let a = 0; a <= 72; a++) {
        const t = (a / 72) * Math.PI * 2;
        const wobble = 1 + 0.12 * Math.sin(3 * t + phase[0]!) + 0.06 * Math.sin(5 * t + phase[1]! + i * 0.15) + 0.04 * Math.sin(8 * t + phase[2]!);
        d += `${a ? "L" : "M"}${f(c.x + Math.cos(t) * r * wobble * 1.25)} ${f(c.y + Math.sin(t) * r * wobble)}`;
      }
      const major = i % 5 === 0;
      lines += `<path d="${d}Z" fill="none" stroke="${major ? "#7fe0c7" : "#2f9e88"}" stroke-width="${major ? 2.2 : 1.2}" opacity="${f(major ? 0.85 : 0.55 - i / 90)}"/>`;
    }
  }
  return svg(
    `<radialGradient id="bg" cx="40%" cy="40%" r="80%"><stop offset="0" stop-color="#11302c"/><stop offset="1" stop-color="#071312"/></radialGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>${lines}
     ${logo(1700, 200, 120, `fill="#f0a868"`)}
     <text x="1700" y="300" fill="#f0a868" font-family="monospace" font-size="20" text-anchor="middle" letter-spacing="6" opacity=".8">ARCH</text>`,
  );
}

function glacier(): string {
  const rand = rng(31);
  const layers = ["#9cc7e6", "#6fa3cf", "#4a7fb2", "#2d5d8f", "#1a3f6a", "#0d2442"];
  return svg(
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1a33"/><stop offset=".7" stop-color="#2f5f8f"/><stop offset="1" stop-color="#a8d4f0"/></linearGradient>
     ${glow("moon", 40)}`,
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>
     ${stars(rand, 140, 500, "#dff1ff")}
     <circle cx="1460" cy="230" r="110" fill="#e8f4ff" filter="url(#moon)" opacity=".45"/>
     <circle cx="1460" cy="230" r="70" fill="#eaf6ff"/>
     ${logo(1460, 236, 70, `fill="#7fa9d6" opacity=".55"`)}
     ${layers.map((c, i) => ridge(rand, 470 + i * 95, 130 - i * 10, 60 + i * 14, c, 1.6)).join("")}`,
  );
}

function ember(): string {
  const rand = rng(43);
  let waves = "";
  const colours = ["#ff4d2e", "#ff8a3d", "#c2185b", "#ffb347", "#8e1b3a"];
  for (let i = 0; i < 9; i++) {
    const y0 = 260 + i * 70;
    const amp = 80 + rand() * 90;
    const ph = rand() * Math.PI * 2;
    let d = `M-20 ${y0}`;
    for (let x = 0; x <= W + 40; x += 40) d += ` L${x} ${f(y0 + Math.sin(x / 260 + ph) * amp + Math.sin(x / 90 + ph * 2) * 14)}`;
    waves += `<path d="${d}" fill="none" stroke="${colours[i % colours.length]}" stroke-width="${f(18 + rand() * 40)}" stroke-linecap="round" opacity="${f(0.35 + rand() * 0.4)}"/>`;
  }
  let sparks = "";
  for (let i = 0; i < 160; i++) {
    sparks += `<circle cx="${f(rand() * W)}" cy="${f(rand() * H)}" r="${f(1 + rand() ** 4 * 4)}" fill="${rand() > 0.5 ? "#ffcf6e" : "#ff7a3d"}" opacity="${f(0.3 + rand() * 0.7)}"/>`;
  }
  return svg(
    `<radialGradient id="bg" cx="50%" cy="70%" r="80%"><stop offset="0" stop-color="#3a0d0a"/><stop offset="1" stop-color="#0c0405"/></radialGradient>
     ${glow("blur", 26)}${glow("soft", 8)}`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>
     <g filter="url(#blur)">${waves}</g>${sparks}
     ${logo(420, 300, 200, `fill="none" stroke="#ffb347" stroke-width=".35" filter="url(#soft)"`)}
     ${logo(420, 300, 200, `fill="none" stroke="#ffd9a0" stroke-width=".18"`)}`,
  );
}

function terminalRain(): string {
  const rand = rng(53);
  const glyphs = "archlinuxpacmanSyuyayhyprlandwaybar01{}[]<>/$#~=+*";
  const cols = 64;
  let rain = "";
  for (let c = 0; c < cols; c++) {
    const x = (c + 0.5) * (W / cols);
    const len = 6 + Math.floor(rand() * 22);
    const start = Math.floor(rand() * 34) - 8;
    let spans = "";
    for (let i = 0; i < len; i++) {
      const g = glyphs[Math.floor(rand() * glyphs.length)]!.replace("<", "&lt;").replace(">", "&gt;");
      const head = i === len - 1;
      spans += `<tspan x="${f(x)}" y="${(start + i) * 32}" fill="${head ? "#d8ffe6" : "#39ff88"}" opacity="${f(head ? 1 : (i / len) * 0.8)}">${g}</tspan>`;
    }
    rain += spans;
  }
  return svg(
    `<radialGradient id="bg" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#03140b"/><stop offset="1" stop-color="#010604"/></radialGradient>
     ${glow("glow", 18)}`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>
     <text font-family="monospace" font-size="24" text-anchor="middle">${rain}</text>
     <rect x="560" y="290" width="800" height="500" fill="#010604" opacity=".82"/>
     <rect x="560" y="290" width="800" height="500" fill="none" stroke="#39ff88" stroke-width="2"/>
     ${logo(960, 500, 230, `fill="#39ff88" filter="url(#glow)" opacity=".55"`)}
     ${logo(960, 500, 230, `fill="#39ff88"`)}
     <text x="600" y="750" font-family="monospace" font-size="28" fill="#39ff88">[root@archlinux ~]# pacman -Syu<tspan fill="#d8ffe6">█</tspan></text>`,
  );
}

function bauhaus(): string {
  const rand = rng(61);
  const colours = ["#e0a526", "#c8553d", "#2a7f7a", "#1f2a44", "#efe6d2", "#7c9fb0"];
  const size = 120;
  const pick = () => colours[Math.floor(rand() * colours.length)]!;
  let tiles = "";
  for (let y = 0; y < H / size; y++) {
    for (let x = 0; x < W / size; x++) {
      const px = x * size, py = y * size;
      const bg = pick();
      let fg = pick();
      while (fg === bg) fg = pick();
      tiles += `<rect x="${px}" y="${py}" width="${size}" height="${size}" fill="${bg}"/>`;
      const kind = Math.floor(rand() * 6);
      const rot = Math.floor(rand() * 4) * 90;
      const t = `transform="rotate(${rot} ${px + 60} ${py + 60})"`;
      if (kind === 0) tiles += `<path d="M${px} ${py} A120 120 0 0 1 ${px + 120} ${py + 120} L${px} ${py + 120} Z" fill="${fg}" ${t}/>`;
      else if (kind === 1) tiles += `<circle cx="${px + 60}" cy="${py + 60}" r="38" fill="${fg}"/>`;
      else if (kind === 2) tiles += `<path d="M${px} ${py + 120} L${px + 60} ${py} L${px + 120} ${py + 120} Z" fill="${fg}" ${t}/>`;
      else if (kind === 3) tiles += `<path d="M${px} ${py + 60} A60 60 0 0 1 ${px + 120} ${py + 60} Z" fill="${fg}" ${t}/>`;
      else if (kind === 4) tiles += `<rect x="${px + 30}" y="${py + 30}" width="60" height="60" fill="${fg}"/>`;
    }
  }
  return svg(
    "",
    `${tiles}<rect x="840" y="420" width="240" height="240" fill="#1f2a44"/>${logo(960, 540, 170, `fill="#efe6d2"`)}`,
  );
}

function aurora(): string {
  const rand = rng(71);
  let curtains = "";
  const colours = ["#3dffa2", "#2de0c8", "#9d6bff", "#3dffa2", "#5be0ff"];
  for (let i = 0; i < 5; i++) {
    const y = 160 + i * 40;
    const ph = rand() * 6;
    let d = `M-100 ${y}`;
    for (let x = -100; x <= W + 100; x += 60) d += ` L${x} ${f(y + Math.sin(x / 300 + ph) * 90)}`;
    curtains += `<path d="${d}" fill="none" stroke="${colours[i]}" stroke-width="${f(60 + rand() * 60)}" opacity="${f(0.35 + rand() * 0.3)}"/>`;
  }
  const lake = 820;
  return svg(
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020611"/><stop offset="1" stop-color="#0a1f2e"/></linearGradient>
     <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
     <mask id="rays"><rect width="${W}" height="${lake}" fill="url(#fade)"/></mask>
     ${glow("blur", 40)}`,
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>
     ${stars(rand, 200, 700)}
     <g filter="url(#blur)" mask="url(#rays)">${curtains}</g>
     ${ridge(rand, 640, 140, 70, "#06121c", 1.8)}
     <rect y="${lake}" width="${W}" height="${H - lake}" fill="#03090f"/>
     <g transform="translate(0 ${lake * 2}) scale(1 -1)" opacity=".28" filter="url(#blur)">${curtains}</g>
     ${logo(960, 560, 90, `fill="#3dffa2" opacity=".9"`)}`,
  );
}

function archBlue(): string {
  let rings = "";
  for (let i = 1; i <= 9; i++) {
    rings += `<circle cx="960" cy="540" r="${150 + i * 90}" fill="none" stroke="#1793d1" stroke-width="${i % 3 === 0 ? 2 : 1}" opacity="${f(0.35 - i * 0.03)}"/>`;
  }
  return svg(
    `<radialGradient id="bg" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#10273f"/><stop offset="1" stop-color="#060d16"/></radialGradient>
     ${glow("glow", 24)}`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>${rings}
     ${logo(960, 520, 340, `fill="#1793d1" filter="url(#glow)" opacity=".5"`)}
     ${logo(960, 520, 340, `fill="#1793d1"`)}
     <text x="960" y="800" fill="#d6e6f2" font-family="sans-serif" font-size="56" font-weight="300" letter-spacing="18" text-anchor="middle">arch<tspan fill="#1793d1" font-weight="600">linux</tspan></text>
     <text x="960" y="850" fill="#5f87a8" font-family="monospace" font-size="20" letter-spacing="8" text-anchor="middle">a simple, lightweight distribution</text>`,
  );
}

function dune(): string {
  const rand = rng(83);
  const dunes = ["#f4b77a", "#e8955a", "#d0703f", "#a8502f", "#7a3424"];
  let body = "";
  dunes.forEach((c, i) => {
    const y = 560 + i * 110;
    const ph = rand() * 6;
    let d = `M0 ${H} L0 ${y}`;
    for (let x = 0; x <= W; x += 40) d += ` L${x} ${f(y - Math.abs(Math.sin(x / (420 - i * 40) + ph)) * (110 - i * 12))}`;
    body += `<path d="${d} L${W} ${H} Z" fill="${c}"/>`;
  });
  return svg(
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a5c"/><stop offset=".55" stop-color="#e38b6d"/><stop offset="1" stop-color="#f8d29a"/></linearGradient>
     ${glow("sun", 50)}`,
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>
     <circle cx="1300" cy="470" r="150" fill="#fff1c9" filter="url(#sun)" opacity=".8"/>
     <circle cx="1300" cy="470" r="95" fill="#fff4d6"/>
     ${body}
     ${logo(520, 330, 110, `fill="#3b2a5c" opacity=".55"`)}`,
  );
}

const SOURCES = [
  { id: "nebula", name: "Nebula", description: "Violet and blue nebula, starfield, glowing logo", make: nebula },
  { id: "outrun", name: "Outrun", description: "Synthwave sunset with a striped sun and neon grid", make: outrun },
  { id: "contour", name: "Contour", description: "Teal topographic contour lines, peach mark", make: contour },
  { id: "glacier", name: "Glacier", description: "Moonlit blue mountain ridges", make: glacier },
  { id: "ember", name: "Ember", description: "Molten red and orange waves with sparks", make: ember },
  { id: "terminal", name: "Terminal", description: "Green glyph rain behind a root prompt", make: terminalRain },
  { id: "bauhaus", name: "Bauhaus", description: "Square geometric tiles in mustard, rust and teal", make: bauhaus },
  { id: "aurora", name: "Aurora", description: "Northern lights over a still lake", make: aurora },
  { id: "arch-blue", name: "Arch Blue", description: "The classic: logo in Arch blue with rings", make: archBlue },
  { id: "dune", name: "Dune", description: "Warm desert dunes under a dusk sun", make: dune },
] as const;

export type WallpaperId = (typeof SOURCES)[number]["id"];
export const WALLPAPER_IDS = SOURCES.map((s) => s.id);

let built: WallpaperDef[] | undefined;

/** Every wallpaper, built on first use. */
export function wallpapers(): WallpaperDef[] {
  built ??= SOURCES.map(({ make, ...meta }) => {
    const s = make();
    return { ...meta, svg: s, url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}` };
  });
  return built;
}

export function wallpaper(id: string): WallpaperDef {
  const w = wallpapers().find((x) => x.id === id);
  if (!w) throw new Error(`no wallpaper "${id}"`);
  return w;
}
