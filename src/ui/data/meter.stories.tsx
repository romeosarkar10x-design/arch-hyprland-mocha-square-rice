import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents } from "../storybook";
import { Meter } from "./meter";

const meta = {
  title: "Data/Meter",
  component: Meter,
  args: { value: 42, label: "memory", readout: "12.8 / 30.5 GiB", accent: "mauve" },
  argTypes: { accent: { control: "select", options: accents } },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Levels: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 380, display: "flex", flexDirection: "column", gap: 14 }}>
      <Meter label="vram" value={30} readout="7.2 / 24 GiB" accent="green" />
      <Meter label="memory" value={78} readout="23.8 / 30.5 GiB" accent="mauve" />
      <Meter label="disk /" value={93} readout="1.74 / 1.86 TiB" accent="blue" />
    </div>
  ),
};

export const Steady: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 380, display: "flex", flexDirection: "column", gap: 14 }}>
      <Meter label="fan" value={88} levels={false} accent="teal" readout="88%" />
      <Meter label="core clock" value={64} levels={false} peak={92} accent="sky" readout="3.62 / 5.66 GHz" />
    </div>
  ),
};

export const Thin: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 380 }}>
      <Meter value={52} cells={60} height={4} accent="yellow" label="volume" />
    </div>
  ),
};
