import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents, iconNames } from "../storybook";
import { Slider } from "./Slider";

const meta = {
  title: "Controls/Slider",
  component: Slider,
  args: { label: "Volume", icon: "volumeMedium", defaultValue: 64 },
  argTypes: { icon: { control: "select", options: iconNames }, accent: { control: "select", options: accents } },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Volume: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 360 }}>
      <Slider label="Volume" icon="volumeMedium" defaultValue={64} />
    </div>
  ),
};

export const Muted: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 360 }}>
      <Slider label="Volume" icon="volumeOff" defaultValue={64} muted />
    </div>
  ),
};

export const Brightness: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 360 }}>
      <Slider label="Brightness" icon="sun" defaultValue={82} accent="peach" ticks={0} />
    </div>
  ),
};
