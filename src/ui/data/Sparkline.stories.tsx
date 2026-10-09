import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/Sparkline.md?raw";
import { guide } from "../storybook";
import { Sparkline } from "./Sparkline";

const meta = {
  title: "Data/Sparkline",
  component: Sparkline,
  args: { data: [12, 18, 30, 22, 41, 37, 25, 19] },
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Colours: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 22, fontSize: 14 }}>
      <span style={{ color: "var(--hx-sky)", display: "inline-flex", gap: 6, alignItems: "center" }}>
        {"cpu "}
        <Sparkline data={[12, 18, 30, 22, 41, 37, 25, 19]} />
      </span>
      <span style={{ color: "var(--hx-green)", display: "inline-flex", gap: 6, alignItems: "center" }}>
        {"gpu "}
        <Sparkline data={[60, 72, 81, 77, 90, 85, 70, 88]} />
      </span>
      <span style={{ color: "var(--hx-yellow)", display: "inline-flex", gap: 6, alignItems: "center" }}>
        {"hot "}
        <Sparkline data={[50, 61, 66, 70, 74, 79, 83, 86]} />
      </span>
    </div>
  ),
};

export const Large: Story = {
  ...fixed,
  render: () => (
    <span style={{ color: "var(--hx-mauve)" }}>
      <Sparkline data={[5, 9, 14, 30, 48, 40, 22, 35, 60, 44, 31, 20, 18, 26, 39, 51]} bars={16} height={40} />
    </span>
  ),
};
