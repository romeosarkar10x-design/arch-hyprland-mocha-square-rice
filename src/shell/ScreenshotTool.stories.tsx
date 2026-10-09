import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenshotTool } from "./ScreenshotTool";

const meta = {
  title: "Shell/Overlays/Screenshot",
  component: ScreenshotTool,
  args: { mode: "region", delay: 0, width: 1100 },
  argTypes: { mode: { control: "inline-radio", options: ["region", "window", "output"] }, delay: { control: "inline-radio", options: [0, 3, 5] }, selection: { control: "object" }, onCapture: { control: false } },
  parameters: { docs: { description: { component: "hyprshot / grimblast with a satty hand-off: the screen freezes, drag a region (or pick window / whole output), then copy, save or annotate." } } },
} satisfies Meta<typeof ScreenshotTool>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Window: Story = { args: { mode: "window" } };
export const Output: Story = { args: { mode: "output" } };
