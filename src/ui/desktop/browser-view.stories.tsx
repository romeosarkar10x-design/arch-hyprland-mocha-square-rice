import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserView } from "./browser-view";

const meta = {
  title: "Apps/BrowserView",
  component: BrowserView,
  args: {},
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
