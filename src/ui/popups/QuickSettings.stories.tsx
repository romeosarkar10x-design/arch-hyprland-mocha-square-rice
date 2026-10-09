import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/QuickSettings.md?raw";
import { guide } from "../storybook";
import { QuickSettings } from "./QuickSettings";

const meta = {
  title: "Shell/Popups/QuickSettings",
  component: QuickSettings,
  args: {},
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof QuickSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Panel: Story = {
  ...fixed,
  render: () => <QuickSettings />,
};

export const Grid: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 380 }}>
      <QuickSettings bare />
    </div>
  ),
};
