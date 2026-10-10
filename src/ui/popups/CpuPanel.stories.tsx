import type { Meta, StoryObj } from "@storybook/react-vite";
import { initialStats } from "..";
import { CpuPanel } from "./CpuPanel";

const meta = {
  title: "Shell/Popups/CpuPanel",
  component: CpuPanel,
  args: {},
} satisfies Meta<typeof CpuPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Live: Story = {
  ...fixed,
  render: () => <CpuPanel />,
};

export const UnderLoad: Story = {
  ...fixed,
  render: () => {
    const s = initialStats(3).cpu;
    return (
      <CpuPanel
        data={{
          ...s,
          usage: 93,
          temp: 87,
          watts: 158,
          mhz: 5480,
          cores: [98, 95, 91, 99, 88, 94, 97, 90, 86, 93, 96, 92],
          history: s.history.map((v, i) => Math.min(100, v + i * 1.2)),
        }}
      />
    );
  },
};

export const PowerLocked: Story = {
  ...fixed,
  render: () => <CpuPanel data={{ ...initialStats(5).cpu, watts: null }} />,
};
