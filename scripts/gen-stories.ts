// Generates stories/<group>/<Name>.stories.tsx for every hyprland-ui component.
//
//   pnpm stories
//
// Sources, all synced from the claude.ai design project:
//   components/<group>/<Name>/<Name>.d.ts   -> prop types + argTypes (controls)
//   components/<group>/<Name>/<Name>.html   -> group (first-line @dsCard marker)
//   _preview/<Name>.js                      -> the design system's own variant stories
//   guidelines/docs/<Name>.md               -> docs page description
//
// Re-run after pulling new components. Hand-tuned Playground args live in SEED_ARGS.

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "stories");

// Starting args for each component's Playground (TSX source). Required props must be here.
const SEED_ARGS: Record<string, string> = {
  BarSegment: `{ icon: "cpu", accent: "sky", children: "19%" }`,
  Button: `{ icon: "settings", children: "Button" }`,
  Calendar: `{ today: new Date(2026, 9, 3) }`,
  ClockPanel: `{ now: new Date(2026, 9, 3, 21, 41, 7) }`,
  CoreGrid: `{ cores: [12, 40, 8, 95, 33, 61, 20, 18, 5, 72, 44, 10], columns: 6 }`,
  Gauge: `{ value: 42, label: "cpu", accent: "sky" }`,
  Graph: `{ series: [{ label: "cpu", data: [12, 18, 30, 22, 41, 37, 25, 19, 33, 28], accent: "sky" }], max: 100 }`,
  Icon: `{ name: "arch", size: 24, color: "var(--hx-mauve)" }`,
  IconButton: `{ icon: "settings", label: "Settings" }`,
  IconTile: `{ icon: "cpu", accent: "sky" }`,
  Kbd: `{ children: "SUPER" }`,
  Launcher: `{ autoFocus: false }`,
  MediaPlayer: `{ track: { title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", length: 243, art: ["mauve", "peach"] } }`,
  Meter: `{ value: 42, label: "memory", readout: "12.8 / 30.5 GiB", accent: "mauve" }`,
  Panel: `{ icon: "cpu", accent: "sky", title: "Panel", subtitle: "subtitle", children: "Panel body" }`,
  PanelSection: `{ label: "section", children: "Section body" }`,
  Shortcut: `{ keys: ["SUPER", "R"] }`,
  Slider: `{ label: "Volume", icon: "volumeMedium", defaultValue: 64 }`,
  Sparkline: `{ data: [12, 18, 30, 22, 41, 37, 25, 19] }`,
  StackBar: `{ total: 30.5, segments: [{ label: "used", value: 9.4, accent: "mauve" }, { label: "cached", value: 4.6, accent: "blue" }] }`,
  Stat: `{ label: "used", value: "9.4", hint: "GiB", accent: "mauve" }`,
  Toast: `{ app: "pacman", appIcon: "package", accent: "sapphire", title: "14 updates available", body: "linux · mesa · hyprland-git" }`,
  ToastStack: `{ children: <Toast app="Spotify" appIcon="spotify" accent="green" title="Midnight City" body="M83" /> }`,
  Toggle: `{ label: "Blur", description: "layer blur under bar and popups", defaultChecked: true }`,
  Tooltip: `{ title: "Memory", subtitle: "DDR5 · 30.5 GiB", icon: "memory", accent: "mauve" }`,
  Unit: `{ children: "W" }`,
  Workspaces: `{ active: 1, workspaces: [{ id: 1, apps: ["code", "ghostty"] }, { id: 2, apps: ["chrome"] }, { id: 3 }, { id: 4 }, { id: 5 }] }`,
};

// Where each card group sits in the sidebar hierarchy, plus per-component moves so the
// tree reads like a desktop: Shell (bar, popups, launchers, overlays), Session, Apps.
const GROUP_PATH: Record<string, string> = {
  foundations: "Foundations",
  controls: "Controls",
  data: "Data",
  bar: "Shell/Bar",
  popups: "Shell/Popups",
  overlays: "Shell/Overlays",
  desktop: "Desktop",
};
const COMPONENT_PATH: Record<string, string> = {
  Launcher: "Shell/Launchers",
  PowerMenu: "Session",
  Terminal: "Apps",
  CodeView: "Apps",
  BrowserView: "Apps",
};

// Extra components a seed references, so the story file imports them.
const SEED_DEPS: Record<string, string[]> = { ToastStack: ["Toast"] };

interface Prop {
  name: string;
  required: boolean;
  type: string;
  doc: string;
}

function parseProps(dts: string, name: string): Prop[] {
  const body = dts.match(new RegExp(`export interface ${name}Props \\{\\n([\\s\\S]*?)\\n\\}`))?.[1];
  if (body === undefined) throw new Error(`${name}.d.ts: no ${name}Props interface`);
  const props: Prop[] = [];
  let doc = "";
  for (const line of body.split("\n")) {
    const comment = line.match(/^\s*\/\*\*\s*(.*?)\s*\*\/\s*$/);
    if (comment) {
      doc = comment[1]!;
      continue;
    }
    const prop = line.match(/^\s+(\w+)(\??): (.+);$/);
    if (prop) {
      props.push({ name: prop[1]!, required: prop[2] === "", type: prop[3]!, doc });
      doc = "";
    }
  }
  return props;
}

function argType(prop: Prop): string | null {
  const { type } = prop;
  const literals = [...type.matchAll(/"([^"]*)"/g)].map((m) => m[1]!);
  let control: string;
  if (literals.length > 0 && /^("[^"]*"\s*\|\s*)*("[^"]*"|\(string & \{\}\))/.test(type)) {
    // The .d.ts truncates the icon union ("+71 more"); use the full list from the bundle.
    const options = type.includes("(string & {})") && literals.includes("arch") ? "iconNames" : JSON.stringify(literals);
    control = `control: "select", options: ${options}`;
  } else if (type === "boolean") {
    control = `control: "boolean"`;
  } else if (type === "number") {
    control = `control: "number"`;
  } else if (["string", "React.ReactNode", "string | number"].includes(type)) {
    control = `control: "text"`;
  } else if (type.includes("=>") || type.includes("Handler") || type === "Date") {
    control = `control: false`;
  } else {
    control = `control: "object"`;
  }
  const description = prop.doc ? `, description: ${JSON.stringify(prop.doc)}` : "";
  return `    ${prop.name}: { ${control}${description}, table: { type: { summary: ${JSON.stringify(type)} } } },`;
}

function previewExports(name: string): string[] {
  const src = readFileSync(join(ROOT, "_preview", `${name}.js`), "utf8");
  const block = src.match(new RegExp(`__export\\(${name}_exports, \\{([\\s\\S]*?)\\}\\);`))?.[1];
  if (block === undefined) throw new Error(`_preview/${name}.js: no export block`);
  // esbuild sorts the export block; list variants in the order the preview defines them.
  const at = (v: string) => src.indexOf(`var ${v} = `);
  return [...block.matchAll(/(\w+): \(\) =>/g)].map((m) => m[1]!).sort((a, b) => at(a) - at(b));
}

function docsDescription(name: string): string {
  const md = readFileSync(join(ROOT, "guidelines", "docs", `${name}.md`), "utf8");
  return md.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
}

function storyFile(group: string, name: string): string {
  const dir = join(ROOT, "components", group, name);
  const props = parseProps(readFileSync(join(dir, `${name}.d.ts`), "utf8"), name);
  const card = readFileSync(join(dir, `${name}.html`), "utf8").split("\n")[0]!;
  const cardGroup = card.match(/group="([^"]+)"/)?.[1] ?? group;
  const path = COMPONENT_PATH[name] ?? GROUP_PATH[cardGroup] ?? cardGroup;
  const missing = props.filter((p) => p.required && !new RegExp(`\\b${p.name}:`).test(SEED_ARGS[name] ?? ""));
  if (missing.length) throw new Error(`${name}: SEED_ARGS lacks required ${missing.map((p) => p.name).join(", ")}`);

  const deps = SEED_DEPS[name] ?? [];
  const usesIcons = props.some((p) => argType(p)?.includes("iconNames"));
  const imports = ["ui", "variant", ...(usesIcons ? ["iconNames"] : [])].join(", ");
  const variants = previewExports(name);

  return `// Generated by scripts/gen-stories.ts from the hyprland-ui sources. Do not edit; re-run \`pnpm stories\`.
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ${name}Props } from "../../components/${group}/${name}/${name}";
${deps.map((d) => `import type { ${d}Props } from "../../components/${group}/${d}/${d}";\n`).join("")}import { ${imports} } from "../../src/hyprland-ui";

const ${name} = ui<${name}Props>("${name}");
${deps.map((d) => `const ${d} = ui<${d}Props>("${d}");\n`).join("")}
const meta = {
  title: "${path}/${name}",
  component: ${name},
  args: ${SEED_ARGS[name] ?? "{}"},
  argTypes: {
${props.map(argType).filter(Boolean).join("\n")}
  },
  parameters: {
    docs: { description: { component: ${JSON.stringify(docsDescription(name))} } },
  },
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
${variants.map((v) => `\nexport const ${v}: Story = variant("${name}", "${v}");`).join("")}
`;
}

rmSync(OUT, { recursive: true, force: true });
let count = 0;
for (const group of readdirSync(join(ROOT, "components")).sort()) {
  for (const name of readdirSync(join(ROOT, "components", group)).sort()) {
    mkdirSync(join(OUT, group), { recursive: true });
    writeFileSync(join(OUT, group, `${name}.stories.tsx`), storyFile(group, name));
    count++;
  }
}
writeFileSync(
  join(OUT, "Introduction.mdx"),
  `{/* Generated by scripts/gen-stories.ts. */}
import { Meta, Markdown } from "@storybook/addon-docs/blocks";
import readme from "../README.md?raw";

<Meta title="Overview/Introduction" />

<Markdown>{readme}</Markdown>
`,
);
console.log(`wrote ${count} story files to stories/`);
