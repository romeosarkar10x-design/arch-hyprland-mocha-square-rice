import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuickSettings } from "./quick-settings";

const meta = {
  title: "Shell/Popups/QuickSettings",
  component: QuickSettings,
  args: {},
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
