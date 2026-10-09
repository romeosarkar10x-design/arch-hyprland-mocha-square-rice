import type { Meta, StoryObj } from "@storybook/react-vite";
import { KeybindCheatsheet } from "./KeybindCheatsheet";
import { Stage } from "./Stage";

const meta = {
  title: "Shell/Overlays/Keybinds",
  component: KeybindCheatsheet,
  args: { query: "", showDispatch: true, width: 1040 },
  argTypes: { groups: { control: "object" } },
  parameters: { docs: { description: { component: "Keybind cheatsheet overlay (suggested on SUPER + /): the binds from your hyprland.lua, grouped and filterable, with the dispatcher each runs. The full list with flags is in **Hyprland → Keybinds**." } } },
} satisfies Meta<typeof KeybindCheatsheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Filtered: Story = { args: { query: "workspace" } };
export const OnScreen: Story = { name: "On screen", render: (args) => <Stage scrim height={760}><KeybindCheatsheet {...args} /></Stage> };
