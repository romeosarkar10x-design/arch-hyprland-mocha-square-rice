import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents } from "../storybook";
import { Visualizer } from "./visualizer";

const meta = {
  title: "Data/Visualizer",
  component: Visualizer,
  args: {},
  argTypes: { from: { control: "select", options: accents }, to: { control: "select", options: accents } },
} satisfies Meta<typeof Visualizer>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Bars: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 440 }}>
      <Visualizer height={96} />
    </div>
  ),
};

export const Mirror: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 440 }}>
      <Visualizer height={96} variant="mirror" from="green" to="teal" />
    </div>
  ),
};

export const Static: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 440 }}>
      <Visualizer
        height={70}
        from="yellow"
        to="peach"
        bars={Array.from({ length: 40 }, (_, i) => 80 * Math.exp(-i / 14) + 10 * Math.abs(Math.sin(i)))}
      />
    </div>
  ),
};
