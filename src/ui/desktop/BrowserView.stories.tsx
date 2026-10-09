import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/BrowserView.md?raw";
import { guide } from "../storybook";
import { BrowserView } from "./BrowserView";

const meta = {
  title: "Apps/BrowserView",
  component: BrowserView,
  args: {},
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof BrowserView>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Repo: Story = {
  ...fixed,
  render: () => (
    <div style={{ position: "relative", width: 820, height: 440, background: "var(--hx-base)" }}>
      <BrowserView />
    </div>
  ),
};
