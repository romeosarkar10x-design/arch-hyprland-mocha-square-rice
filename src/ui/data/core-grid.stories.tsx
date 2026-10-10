import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents } from "../storybook";
import { CoreGrid } from "./core-grid";

const meta = {
  title: "Data/CoreGrid",
  component: CoreGrid,
  args: { cores: [12, 40, 8, 95, 33, 61, 20, 18, 5, 72, 44, 10], columns: 6 },
  argTypes: { accent: { control: "select", options: accents } },
} satisfies Meta<typeof CoreGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Mixed: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 400 }}>
      <CoreGrid cores={[12, 40, 8, 95, 33, 61, 20, 18, 5, 72, 44, 10]} columns={6} />
    </div>
  ),
};

export const Idle: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 400 }}>
      <CoreGrid cores={[2, 5, 1, 0, 3, 7, 1, 2, 4, 0, 1, 6]} columns={6} />
    </div>
  ),
};

export const Saturated: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 400 }}>
      <CoreGrid cores={[98, 95, 91, 99, 88, 94, 97, 90, 86, 93, 96, 92]} columns={6} />
    </div>
  ),
};
