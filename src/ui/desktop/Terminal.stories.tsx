import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/Terminal.md?raw";
import { guide } from "../storybook";
import { Terminal } from "./Terminal";

const meta = {
  title: "Apps/Terminal",
  component: Terminal,
  args: {},
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof Terminal>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Fastfetch: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 560, background: "var(--hx-base)" }}>
      <Terminal />
    </div>
  ),
};

export const Short: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 560, background: "var(--hx-base)" }}>
      <Terminal
        cwd="~/.config/hypr"
        lines={[{ cmd: "hyprctl reload" }, { out: "ok" }, { cmd: "hyprctl configerrors" }, { out: <span className="hx-green">no errors</span> }]}
      />
    </div>
  ),
};
