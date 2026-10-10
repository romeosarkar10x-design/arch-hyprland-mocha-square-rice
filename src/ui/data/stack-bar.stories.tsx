import type { Meta, StoryObj } from "@storybook/react-vite";
import { StackBar } from "./stack-bar";

const meta = {
  title: "Data/StackBar",
  component: StackBar,
  args: {
    total: 30.5,
    segments: [
      { label: "used", value: 9.4, accent: "mauve" },
      { label: "cached", value: 4.6, accent: "blue" },
    ],
  },
} satisfies Meta<typeof StackBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Memory: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 420 }}>
      <StackBar
        total={30.5}
        format={(v) => v.toFixed(1) + " GiB"}
        segments={[
          { label: "used", value: 9.4, accent: "mauve" },
          { label: "cached", value: 4.6, accent: "blue" },
        ]}
      />
    </div>
  ),
};

export const Disk: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 420 }}>
      <StackBar
        total={1860}
        format={(v) => v + " GiB"}
        segments={[
          { label: "system", value: 112, accent: "sky" },
          { label: "games", value: 820, accent: "green" },
          { label: "home", value: 404, accent: "peach" },
        ]}
      />
    </div>
  ),
};
