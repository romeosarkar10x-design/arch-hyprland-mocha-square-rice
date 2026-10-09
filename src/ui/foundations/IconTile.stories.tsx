import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/IconTile.md?raw";
import { accents, guide, iconNames } from "../storybook";
import { IconTile } from "./IconTile";

const meta = {
  title: "Foundations/IconTile",
  component: IconTile,
  args: { icon: "cpu", accent: "sky" },
  argTypes: { icon: { control: "select", options: iconNames }, accent: { control: "select", options: accents } },
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof IconTile>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Accents: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 10 }}>
      <IconTile icon="cpu" accent="sky" />
      <IconTile icon="gpu" accent="green" />
      <IconTile icon="memory" accent="mauve" />
      <IconTile icon="ethernet" accent="sapphire" />
      <IconTile icon="volumeHigh" accent="yellow" />
      <IconTile icon="power" accent="red" />
    </div>
  ),
};

export const Sizes: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
      <IconTile icon="spotify" accent="green" size={24} />
      <IconTile icon="spotify" accent="green" size={36} />
      <IconTile icon="spotify" accent="green" size={56} />
    </div>
  ),
};
