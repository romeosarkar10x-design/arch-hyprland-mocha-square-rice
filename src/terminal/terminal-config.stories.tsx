import type { Meta, StoryObj } from "@storybook/react-vite";
import { TerminalConfig } from "../theme/config-file";
import { EMULATORS } from "../theme/exports";

const meta = {
  title: "Apps/Terminal Config",
  component: TerminalConfig,
  args: { emulator: "ghostty", font: "asiLonoM", fontSize: 12, opacity: 0.92, padding: 12, cursor: "block", cursorBlink: true, tabStyle: "powerline", maxHeight: 640 },
  argTypes: {
    emulator: { control: "inline-radio", options: EMULATORS },
    cursor: { control: "inline-radio", options: ["block", "beam", "underline"] },
    tabStyle: { control: "select", options: ["powerline", "slant", "separator", "fade", "hidden"] },
    opacity: { control: { type: "range", min: 0.5, max: 1, step: 0.01 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Ready-to-paste config for each terminal emulator, generated from the theme in effect (switch the **Theme** toolbar to export a wallpaper theme). Same ANSI mapping as **Apps → Terminal Emulator**; window decorations off since Hyprland draws the border.",
      },
    },
  },
} satisfies Meta<typeof TerminalConfig>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghostty: Story = {};
export const Kitty: Story = { args: { emulator: "kitty" } };
export const Alacritty: Story = { args: { emulator: "alacritty" } };
export const Foot: Story = { args: { emulator: "foot" } };
export const WezTerm: Story = { args: { emulator: "wezterm" } };
