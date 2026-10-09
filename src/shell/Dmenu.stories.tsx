import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dmenu } from "./Dmenu";
import { Stage } from "./Stage";

const meta = {
  title: "Shell/Launchers/Dmenu",
  component: Dmenu,
  args: { prompt: "run", query: "" },
  argTypes: { items: { control: "object" }, lines: { control: "number" }, onSelect: { control: false } },
  parameters: { docs: { description: { component: "dmenu / tofi / fuzzel-style strip (SUPER + D), across the top of the screen where the bar is. Prefix matches first. Arrows / Tab move, Enter runs. Set `lines` for the vertical `-l N` list." } } },
} satisfies Meta<typeof Dmenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Filtering: Story = { args: { query: "bl" } };
export const Vertical: Story = { args: { lines: 10, width: 520, prompt: "drun" } };
export const OnScreen: Story = { name: "On screen", render: (args) => <Stage place="top"><Dmenu {...args} width="100%" /></Stage> };
