import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents, iconNames } from "../storybook";
import { IconButton } from "./IconButton";

const meta = {
  title: "Controls/IconButton",
  component: IconButton,
  args: { icon: "settings", label: "Settings" },
  argTypes: { icon: { control: "select", options: iconNames }, accent: { control: "select", options: accents } },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Transport: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <IconButton icon="shuffle" label="Shuffle" size="sm" accent="green" />
      <IconButton icon="previous" label="Previous" />
      <IconButton icon="pause" label="Pause" variant="primary" accent="green" size="lg" />
      <IconButton icon="next" label="Next" />
      <IconButton icon="repeat" label="Repeat" size="sm" accent="green" active />
    </div>
  ),
};

export const Variants: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <IconButton icon="settings" label="Settings" />
      <IconButton icon="settings" label="Settings" variant="outline" />
      <IconButton icon="settings" label="Settings" variant="primary" accent="lavender" />
      <IconButton icon="close" label="Close" variant="outline" />
    </div>
  ),
};
