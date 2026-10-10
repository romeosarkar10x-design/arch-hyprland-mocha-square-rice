import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents, iconNames } from "../storybook";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Shell/Bar/Tooltip",
  component: Tooltip,
  args: { title: "Memory", subtitle: "DDR5 · 30.5 GiB", icon: "memory", accent: "mauve" },
  argTypes: { icon: { control: "select", options: iconNames }, accent: { control: "select", options: accents } },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Memory: Story = {
  ...fixed,
  render: () => (
    <Tooltip
      title="Memory"
      subtitle="DDR5 · 30.5 GiB"
      icon="memory"
      accent="mauve"
      rows={[
        { label: "ram", value: "9.4 GiB", bar: 31 },
        { label: "cached", value: "4.6 GiB", bar: 15 },
        { label: "swap", value: "0.3 GiB", bar: 4 },
      ]}
      hints={[["click", "btop"]]}
    />
  ),
};

export const Audio: Story = {
  ...fixed,
  render: () => (
    <Tooltip
      title="Audio"
      subtitle="Sennheiser HD 650"
      icon="headphones"
      accent="yellow"
      rows={[
        { label: "volume", value: "64%", bar: 64 },
        { label: "rate", value: "48 kHz" },
      ]}
      hints={[
        ["click", "mixer"],
        ["right", "mute"],
        ["scroll", "±2%"],
      ]}
    />
  ),
};

export const Plain: Story = {
  ...fixed,
  render: () => <Tooltip title="Arch Linux" subtitle="7.2.2-arch1-1" icon="arch" accent="mauve" hints={[["click", "launcher"]]} />,
};
