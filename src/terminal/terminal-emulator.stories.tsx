import type { Meta, StoryObj } from "@storybook/react-vite";
import { EMULATORS } from "../theme/exports";
import { PROGRAMS } from "./programs";
import { TerminalEmulator } from "./terminal-emulator";

const meta = {
  title: "Apps/Terminal Emulator",
  component: TerminalEmulator,
  args: {
    emulator: "ghostty",
    program: "fastfetch",
    fontSize: 12.5,
    padding: 12,
    opacity: 0.92,
    cursor: "block",
    cursorBlink: true,
    tabs: ["zsh", "nvim", "btop"],
    activeTab: 0,
    tabStyle: "powerline",
    decorations: false,
    framed: true,
    focused: true,
    backdrop: true,
  },
  argTypes: {
    emulator: { control: "inline-radio", options: EMULATORS },
    program: { control: "select", options: PROGRAMS },
    fontSize: { control: { type: "range", min: 9, max: 18, step: 0.5 } },
    padding: { control: { type: "range", min: 0, max: 32, step: 1 } },
    opacity: { control: { type: "range", min: 0.5, max: 1, step: 0.01 }, description: "background-opacity; Hyprland blurs what shows through" },
    cursor: { control: "inline-radio", options: ["block", "beam", "underline"] },
    tabStyle: { control: "select", options: ["powerline", "slant", "separator", "fade", "hidden"], description: "kitty tab_bar_style" },
    tabs: { control: "object" },
    activeTab: { control: "number" },
    decorations: { control: "boolean", description: "Client-side decorations (Ghostty header bar, foot CSD)" },
    width: { control: "number" },
    height: { control: "number" },
  },
  parameters: {
    docs: {
      description: {
        component: `How each terminal emulator in the rice looks: Ghostty, kitty, Alacritty, foot and WezTerm, each with its own tab bar / decorations, running fastfetch, btop, yazi, nvim, pacman or a shell.

All colour comes from the **16-colour ANSI palette derived from the theme** (Catppuccin mapping: black = surface1, magenta = pink, cyan = teal), so it follows wallpaper themes. The matching config files are in **Apps → Terminal Config**.`,
      },
    },
  },
} satisfies Meta<typeof TerminalEmulator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Ghostty: Story = { args: { emulator: "ghostty", decorations: true } };
export const Kitty: Story = { args: { emulator: "kitty", program: "btop", tabs: ["zsh", "btop", "ssh pi"], activeTab: 1 } };
export const KittyTabStyles: Story = {
  name: "Kitty tab styles",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["powerline", "slant", "separator", "fade"] as const).map((s) => (
        <TerminalEmulator key={s} {...args} emulator="kitty" tabStyle={s} program="shell" height={170} title={s} activeTab={1} />
      ))}
    </div>
  ),
};
export const Alacritty: Story = { args: { emulator: "alacritty", program: "nvim", opacity: 0.85 } };
export const Foot: Story = { args: { emulator: "foot", program: "pacman", decorations: true } };
export const WezTerm: Story = { args: { emulator: "wezterm", program: "yazi", tabs: ["yazi", "zsh"] } };
export const Btop: Story = { args: { program: "btop", width: 900, height: 560 } };
export const Glass: Story = { args: { opacity: 0.6, program: "shell" } };
export const CursorShapes: Story = {
  name: "Cursor shapes",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["block", "beam", "underline"] as const).map((c) => (
        <TerminalEmulator key={c} {...args} cursor={c} program="shell" width={420} height={380} tabs={[c]} />
      ))}
    </div>
  ),
};
