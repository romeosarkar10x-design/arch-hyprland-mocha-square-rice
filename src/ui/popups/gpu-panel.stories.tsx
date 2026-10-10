import type { Meta, StoryObj } from "@storybook/react-vite";
import { initialStats } from "..";
import { GpuPanel } from "./gpu-panel";

const meta = {
  title: "Shell/Popups/GpuPanel",
  component: GpuPanel,
  args: {},
} satisfies Meta<typeof GpuPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Live: Story = {
  ...fixed,
  render: () => <GpuPanel />,
};

export const Gaming: Story = {
  ...fixed,
  render: () => {
    const g2 = initialStats(11).gpu;
    return (
      <GpuPanel
        data={{
          ...g2,
          usage: 97,
          temp: 81,
          power: 418,
          fan: 78,
          clock: 2010,
          vramUsed: 19800,
          powerHistory: g2.powerHistory.map((p) => Math.min(450, p + 180)),
        }}
      />
    );
  },
};
