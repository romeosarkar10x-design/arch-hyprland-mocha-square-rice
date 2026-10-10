import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ScreenshotAnnotator } from "./screenshot-annotator";
import { ScreenshotTool } from "./screenshot-tool";

const meta = {
  title: "Shell/Screenshot/Capture",
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

function CaptureFlow() {
  const [region, setRegion] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  if (region) return <ScreenshotAnnotator region={region} shapes={[]} onExport={() => setRegion(null)} />;
  return <ScreenshotTool onCapture={(action, rect) => action === "edit" && rect.w > 40 && rect.h > 40 && setRegion(rect)} />;
}

export const CaptureThenAnnotate: Story = {
  name: "Capture → annotate",
  parameters: { controls: { disable: true }, docs: { description: { story: "Drag a region, press **Annotate**: it opens in the satty editor (**Shell → Screenshot → Annotate**). Copy or Save goes back to capture." } } },
  render: () => <CaptureFlow />,
};
