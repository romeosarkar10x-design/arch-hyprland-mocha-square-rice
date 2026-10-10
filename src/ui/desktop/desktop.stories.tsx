import type { Meta, StoryObj } from "@storybook/react-vite";
import { Desktop } from "./desktop";

const meta = {
  title: "Desktop/Desktop",
  component: Desktop,
  args: {},
} satisfies Meta<typeof Desktop>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Workspace1: Story = {
  ...fixed,
  render: () => <Desktop notifications={false} />,
};

export const CpuPopupOpen: Story = {
  ...fixed,
  render: () => <Desktop openPopup="cpu" notifications={false} />,
};

export const Browser: Story = {
  ...fixed,
  render: () => <Desktop workspace={2} openPopup="audio" notifications={false} />,
};

export const Launcher: Story = {
  ...fixed,
  render: () => <Desktop workspace={3} openPopup="launcher" notifications={false} />,
};
