import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents, iconNames } from "../storybook";
import { Button } from "./button";

const meta = {
  title: "Controls/Button",
  component: Button,
  args: { icon: "settings", children: "Button" },
  argTypes: { icon: { control: "select", options: iconNames }, accent: { control: "select", options: accents } },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Variants: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <Button variant="primary" icon="download">
        Update all
      </Button>
      <Button icon="chart" accent="sky" kbd="B">
        btop
      </Button>
      <Button variant="ghost">Later</Button>
      <Button variant="danger" icon="power">
        Shut down
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button size="sm" icon="settings" accent="lavender">
        sm
      </Button>
      <Button size="md" icon="settings" accent="lavender">
        medium
      </Button>
      <Button size="lg" icon="settings" accent="lavender">
        large
      </Button>
    </div>
  ),
};

export const Accents: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button icon="ethernet" accent="sapphire">
        network
      </Button>
      <Button icon="cpu" accent="sky">
        cpu
      </Button>
      <Button icon="gpu" accent="green">
        gpu
      </Button>
      <Button icon="memory" accent="mauve">
        memory
      </Button>
      <Button icon="volumeHigh" accent="yellow">
        audio
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Button variant="primary" icon="download" disabled>
        Updating…
      </Button>
      <Button disabled>Unavailable</Button>
    </div>
  ),
};
