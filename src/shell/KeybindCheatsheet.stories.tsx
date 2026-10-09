import type { Meta, StoryObj } from "@storybook/react-vite";
import { KeybindCheatsheet } from "./KeybindCheatsheet";
import { Stage } from "./Stage";

const meta = {
  title: "Shell/Overlays/Keybinds",
  component: KeybindCheatsheet,
  args: { query: "", showDispatch: true, width: 1040 },
  argTypes: { groups: { control: "object" } },
  parameters: { docs: { description: { component: "SUPER + / cheatsheet: every bind from binds.conf, grouped and filterable, with the dispatcher it runs." } } },
} satisfies Meta<typeof KeybindCheatsheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Filtered: Story = { args: { query: "workspace" } };
export const OnScreen: Story = { name: "On screen", render: (args) => <Stage scrim height={760}><KeybindCheatsheet {...args} /></Stage> };
