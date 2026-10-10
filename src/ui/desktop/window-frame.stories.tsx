import type { Meta, StoryObj } from "@storybook/react-vite";
import { Terminal } from "..";
import { WindowFrame } from "./window-frame";

const meta = {
  title: "Desktop/WindowFrame",
  component: WindowFrame,
  args: {},
} satisfies Meta<typeof WindowFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const FocusedAndNot: Story = {
  ...fixed,
  render: () => (
    <div style={{ position: "relative", width: 900, height: 340 }}>
      <WindowFrame focused tag="ghostty" style={{ left: 0, top: 0, width: 447, height: 340 }}>
        <Terminal />
      </WindowFrame>
      <WindowFrame tag="ghostty" style={{ left: 453, top: 0, width: 447, height: 340 }}>
        <Terminal lines={[{ cmd: "hyprctl activewindow" }, { out: "Window 5a1c (ghostty):\n	workspace: 1\n	floating: 0\n	focusHistoryID: 1" }]} />
      </WindowFrame>
    </div>
  ),
};
