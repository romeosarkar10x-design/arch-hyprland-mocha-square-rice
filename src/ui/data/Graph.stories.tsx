import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/Graph.md?raw";
import { guide } from "../storybook";
import { initialStats, rate } from "..";
import { Graph } from "./Graph";

const meta = {
  title: "Data/Graph",
  component: Graph,
  args: { series: [{ label: "cpu", data: [12, 18, 30, 22, 41, 37, 25, 19, 33, 28], accent: "sky" }], max: 100 },
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof Graph>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

const s = initialStats(7);

export const Area: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 420 }}>
      <Graph series={[{ label: "cpu", data: s.cpu.history, accent: "sky" }]} max={100} />
    </div>
  ),
};

export const Mirrored: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 420 }}>
      <Graph
        height={110}
        format={rate}
        series={[
          { label: "down", data: s.net.rxHistory, accent: "sapphire" },
          { label: "up", data: s.net.txHistory, accent: "pink", mirror: true },
        ]}
      />
    </div>
  ),
};

export const Bars: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 420 }}>
      <Graph kind="bars" max={450} format={(v) => Math.round(v) + " W"} series={[{ label: "power", data: s.gpu.powerHistory, accent: "peach" }]} />
    </div>
  ),
};
