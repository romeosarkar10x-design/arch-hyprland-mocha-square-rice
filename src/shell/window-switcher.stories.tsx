import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stage } from "./stage";
import { WindowSwitcher } from "./window-switcher";

const meta = {
  title: "Shell/Overlays/Window Switcher",
  component: WindowSwitcher,
  args: { selected: 1 },
  argTypes: { selected: { control: { type: "range", min: 0, max: 8 } }, windows: { control: "object" }, onSelect: { control: false } },
  parameters: { docs: { description: { component: "ALT + TAB across all workspaces. Focus it and use Tab / arrows to cycle, Enter to pick." } } },
} satisfies Meta<typeof WindowSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const OnScreen: Story = { name: "On screen", render: (args) => <Stage><WindowSwitcher {...args} /></Stage> };
