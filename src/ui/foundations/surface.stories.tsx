import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Toast } from "..";
import { Surface } from "./surface";

const meta = {
  title: "Foundations/Surface",
  component: Surface,
  args: {},
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Tones: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {(["crust", "mantle", "base"] as const).map((t) => (
        <Surface key={t} tone={t} padding={16}>
          <span className="hx-caps">{t}</span>
          <div style={{ marginTop: 8 }}>
            <Button icon="settings">action</Button>
          </div>
        </Surface>
      ))}
    </div>
  ),
};

export const Wallpaper: Story = {
  ...fixed,
  render: () => (
    <Surface tone="wallpaper" padding={28}>
      <Toast app="Hyprland" appIcon="monitor" title="Config reloaded" body="hyprland.lua · 0 errors" accent="mauve" />
    </Surface>
  ),
};
