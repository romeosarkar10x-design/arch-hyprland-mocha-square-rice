import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents } from "../storybook";
import { Gauge } from "./Gauge";

const meta = {
  title: "Data/Gauge",
  component: Gauge,
  args: { value: 42, label: "cpu", accent: "sky" },
  argTypes: { accent: { control: "select", options: accents } },
} satisfies Meta<typeof Gauge>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Levels: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <Gauge value={24} label="load" accent="sky" />
      <Gauge value={68} label="load" accent="sky" />
      <Gauge value={94} label="load" accent="sky" />
    </div>
  ),
};

export const Units: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <Gauge value={58} max={100} unit="°" label="temp" accent="teal" warn={75} crit={85} sub="k10temp" />
      <Gauge value={212} max={450} unit="W" label="power" accent="peach" warn={70} crit={90} sub="of 450 W" />
      <Gauge value={41} label="fan" accent="green" sub="1240 rpm" />
    </div>
  ),
};

export const Sizes: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Gauge value={35} label="cpu" size={84} segments={28} />
      <Gauge value={35} label="cpu" size={116} />
      <Gauge value={35} label="cpu" size={160} segments={48} />
    </div>
  ),
};
