import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeView } from "./CodeView";

const meta = {
  title: "Apps/CodeView",
  component: CodeView,
  args: {},
} satisfies Meta<typeof CodeView>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Normal: Story = {
  ...fixed,
  render: () => (
    <div style={{ position: "relative", width: 640, height: 440, background: "var(--hx-base)" }}>
      <CodeView />
    </div>
  ),
};

export const Insert: Story = {
  ...fixed,
  render: () => (
    <div style={{ position: "relative", width: 640, height: 200, background: "var(--hx-base)" }}>
      <CodeView
        mode="INSERT"
        file="init.lua"
        cursorLine={3}
        code={`local opt = vim.opt

opt.number = true
opt.relativenumber = true
opt.guicursor = "a:block"`}
      />
    </div>
  ),
};
