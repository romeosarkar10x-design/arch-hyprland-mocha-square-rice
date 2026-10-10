import type { Meta, StoryObj } from "@storybook/react-vite";
import { NetworkPanel } from "./NetworkPanel";

const meta = {
  title: "Shell/Popups/NetworkPanel",
  component: NetworkPanel,
  args: {},
} satisfies Meta<typeof NetworkPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Live: Story = {
  ...fixed,
  render: () => <NetworkPanel />,
};

export const Frozen: Story = {
  ...fixed,
  render: () => <NetworkPanel paused />,
};
