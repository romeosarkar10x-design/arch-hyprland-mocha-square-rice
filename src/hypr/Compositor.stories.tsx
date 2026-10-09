import type { Meta, StoryObj } from "@storybook/react-vite";
import { ANIMATIONS } from "./config";
import { Compositor, TOURS } from "./Compositor";

const meta = {
  title: "Hyprland/Live Session",
  component: Compositor,
  args: { modifier: "implied", timeScale: 1, showKeys: true, captions: true, resizeStep: 40, workspace: 1, tour: null },
  argTypes: {
    modifier: { control: "inline-radio", options: ["implied", "super"] },
    tour: { control: "select", options: [null, ...Object.keys(TOURS)] },
    timeScale: { control: { type: "range", min: 0.5, max: 5, step: 0.5 }, description: "Slow motion factor for every animation" },
    resizeStep: { control: { type: "range", min: 10, max: 120, step: 5 } },
    workspace: { control: { type: "range", min: 1, max: 10 } },
    look: { control: "object" },
    animations: { control: false },
    curves: { control: false },
    windows: { control: "object" },
  },
  parameters: {
    docs: {
      description: {
        component: `A Hyprland session you drive with the keyboard, using the binds, layout, borders and animations from your \`~/.config/hypr/hyprland.lua\`.

**Click the screen, then:**

| keys | does |
|---|---|
| \`⏎\` | open a terminal (dwindle splits the focused window along its longer side) |
| \`h j k l\` | move focus |
| \`Shift + h j k l\` | swap windows |
| \`Alt + h j k l\` | resize (hold to repeat) |
| \`o\` / \`u\` | preselect: next window opens below / right |
| \`v\` | toggle floating |
| \`x\` | close |
| \`1 … 0\` | switch workspace (slide) |
| \`Shift + 1 … 0\` | move window to workspace |
| \`s\` / \`Shift + s\` | scratchpad / move window to scratchpad (slidevert) |
| \`Space\` | launcher (wofi) |
| \`e\` | file manager |
| volume keys | OSD |

SUPER is implied: your real Hyprland catches SUPER before the browser sees it, so in this demo plain keys act as SUPER + key. Set \`modifier: "super"\` to require the real key (outside Hyprland).

Timings come from your \`hl.animation\` lines (speed × 100 ms) and \`hl.curve\` beziers: windows pop in with \`overshot\` (410 ms), move with \`easeOutQuint\` (400 ms), workspaces slide in 300 ms, the gradient border turns once every 6 s. Use **timeScale** for slow motion.`,
      },
    },
  },
} satisfies Meta<typeof Compositor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
export const TilingTour: Story = { name: "Tour: tiling", args: { tour: "tiling" } };
export const WorkspacesTour: Story = { name: "Tour: workspaces", args: { tour: "workspaces" } };
export const SlowMotion: Story = { name: "Slow motion (3×)", args: { tour: "tiling", timeScale: 3 } };
export const Empty: Story = { name: "Empty desktop", args: { windows: {} } };
export const NoAnimations: Story = {
  name: "Animations off",
  args: { animations: Object.fromEntries(Object.entries(ANIMATIONS).map(([k, a]) => [k, { ...a, enabled: false }])), tour: "tiling" },
};
export const RealSuperKey: Story = { name: "Real SUPER key", args: { modifier: "super" } };
