import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/ClockPanel.md?raw";
import { guide } from "../storybook";
import { ClockPanel } from "./ClockPanel";

const meta = {
  title: "Shell/Popups/ClockPanel",
  component: ClockPanel,
  args: { now: new Date(2026, 9, 3, 21, 41, 7) },
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof ClockPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Evening: Story = {
  ...fixed,
  render: () => <ClockPanel now={new Date(2026, 9, 3, 21, 41, 7)} />,
};

export const Morning: Story = {
  ...fixed,
  render: () => <ClockPanel now={new Date(2026, 9, 26, 7, 5, 42)} />,
};
