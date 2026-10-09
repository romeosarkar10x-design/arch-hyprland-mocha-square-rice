import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/MemoryPanel.md?raw";
import { guide } from "../storybook";
import { initialStats } from "..";
import { MemoryPanel } from "./MemoryPanel";

const meta = {
  title: "Shell/Popups/MemoryPanel",
  component: MemoryPanel,
  args: {},
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof MemoryPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Live: Story = {
  ...fixed,
  render: () => <MemoryPanel />,
};

export const Pressure: Story = {
  ...fixed,
  render: () => {
    const m = initialStats(2).mem;
    return <MemoryPanel data={{ ...m, used: 27.9 * 1024 ** 3, cached: 1.8 * 1024 ** 3, swapUsed: 5.6 * 1024 ** 3 }} />;
  },
};
