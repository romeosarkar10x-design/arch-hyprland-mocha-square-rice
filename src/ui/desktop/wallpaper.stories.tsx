import type { Meta, StoryObj } from "@storybook/react-vite";
import { Wallpaper } from "./wallpaper";

const meta = {
  title: "Desktop/Wallpaper",
  component: Wallpaper,
  args: {},
} satisfies Meta<typeof Wallpaper>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Aurora: Story = {
  ...fixed,
  render: () => (
    <div style={{ position: "relative", width: 720, height: 405 }}>
      <Wallpaper variant="aurora" />
    </div>
  ),
};

export const Tiles: Story = {
  ...fixed,
  render: () => (
    <div style={{ position: "relative", width: 720, height: 405 }}>
      <Wallpaper variant="tiles" />
    </div>
  ),
};
