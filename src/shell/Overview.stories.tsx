import type { Meta, StoryObj } from "@storybook/react-vite";
import { Overview } from "./Overview";

const meta = {
  title: "Shell/Overlays/Workspace Overview",
  component: Overview,
  args: { active: 1, columns: 3 },
  argTypes: { active: { control: { type: "range", min: 1, max: 6 } }, columns: { control: { type: "range", min: 2, max: 5 } }, workspaces: { control: "object" }, onSelect: { control: false } },
  parameters: { docs: { description: { component: "hyprexpo-style overview (SUPER + TAB): every workspace as a miniature with its tiled windows; click one to jump." } } },
} satisfies Meta<typeof Overview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const TwoRows: Story = { name: "Wide", args: { columns: 4 } };
