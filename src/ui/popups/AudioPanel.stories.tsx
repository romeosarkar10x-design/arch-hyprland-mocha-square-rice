import type { Meta, StoryObj } from "@storybook/react-vite";
import { AudioPanel } from "./AudioPanel";

const meta = {
  title: "Shell/Popups/AudioPanel",
  component: AudioPanel,
  args: {},
} satisfies Meta<typeof AudioPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Playing: Story = {
  ...fixed,
  render: () => <AudioPanel />,
};

export const Muted: Story = {
  ...fixed,
  render: () => <AudioPanel muted output="monitors" />,
};
