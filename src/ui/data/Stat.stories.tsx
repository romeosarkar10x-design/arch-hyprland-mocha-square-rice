import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/Stat.md?raw";
import { accents, guide } from "../storybook";
import { Stat } from "./Stat";

const meta = {
  title: "Data/Stat",
  component: Stat,
  args: { label: "used", value: "9.4", hint: "GiB", accent: "mauve" },
  argTypes: { accent: { control: "select", options: accents } },
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Grid: Story = {
  ...fixed,
  render: () => (
    <div className="hx-stats" style={{ width: 420 }}>
      <Stat label="used" value="9.4" hint="GiB" accent="mauve" />
      <Stat label="cached" value="4.6" hint="GiB" accent="blue" />
      <Stat label="available" value="21.1" hint="GiB" />
    </div>
  ),
};

export const Rates: Story = {
  ...fixed,
  render: () => (
    <div className="hx-stats" style={{ width: 320 }}>
      <Stat label="down" value="2.4 MiB/s" accent="sapphire" />
      <Stat label="up" value="312 KiB/s" accent="pink" />
    </div>
  ),
};
