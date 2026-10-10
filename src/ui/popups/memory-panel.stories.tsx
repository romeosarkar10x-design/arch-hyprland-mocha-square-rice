import type { Meta, StoryObj } from "@storybook/react-vite";
import { initialStats } from "..";
import { MemoryPanel } from "./memory-panel";

const meta = {
  title: "Shell/Popups/MemoryPanel",
  component: MemoryPanel,
  args: {},
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
