import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConfigFile } from "../theme/config-file";
import { HyprKeybinds } from "./hypr-keybinds";
import source from "./hyprland.lua?raw";

const meta = {
  title: "Hyprland/Keybinds",
  component: HyprKeybinds,
  args: { suggestions: true, query: "" },
  argTypes: { groups: { control: "object" } },
  parameters: {
    docs: {
      description: {
        component:
          "Every bind in your `~/.config/hypr/hyprland.lua`, with the Lua dispatcher it calls and its flags (`locked` works on the lock screen, `repeating` repeats while held). A test checks this list against the file. The last group suggests binds for the rest of the rice (screenshot, clipboard, lock…) on keys that are still free. Try them in **Hyprland → Live Session**.",
      },
    },
  },
} satisfies Meta<typeof HyprKeybinds>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllBinds: Story = { name: "All binds" };
export const OnlyYours: Story = { name: "Only hyprland.lua", args: { suggestions: false } };
export const Filtered: Story = { args: { query: "workspace" } };
export const Source: Story = {
  name: "hyprland.lua source",
  parameters: { controls: { disable: true } },
  render: () => <ConfigFile file="~/.config/hypr/hyprland.lua" text={source} maxHeight={720} />,
};
