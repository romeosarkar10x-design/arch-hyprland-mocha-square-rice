import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "./Kbd";

const meta = {
  title: "Foundations/Kbd",
  component: Kbd,
  args: { children: "SUPER" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Keys: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <Kbd>SUPER</Kbd>
      <Kbd>SHIFT</Kbd>
      <Kbd>CTRL</Kbd>
      <Kbd>↵</Kbd>
      <Kbd>esc</Kbd>
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
      <Kbd>1</Kbd>
    </div>
  ),
};

export const InText: Story = {
  ...fixed,
  render: () => (
    <p style={{ margin: 0, fontSize: 12.5, color: "var(--hx-subtext0)" }}>
      {"Press "}
      <Kbd>SUPER</Kbd> <Kbd>R</Kbd>
      {" for the launcher, "}
      <Kbd>esc</Kbd>
      {" to close it."}
    </p>
  ),
};
