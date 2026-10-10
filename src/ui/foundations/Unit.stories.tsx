import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bar, BarSegment } from "..";
import { Unit } from "./Unit";

const meta = {
  title: "Foundations/Unit",
  component: Unit,
  args: { children: "W" },
} satisfies Meta<typeof Unit>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const InSegments: Story = {
  ...fixed,
  render: () => (
    <Bar
      right={
        <>
          <BarSegment icon="cpu" accent="sky">
            12% 46° 61
            <Unit>W</Unit>
          </BarSegment>
          <BarSegment icon="gpu" accent="green" divider>
            42% 61° 212
            <Unit>W</Unit>
          </BarSegment>
          <BarSegment icon="clock" divider variant="clock">
            {"09:41 "}
            <Unit>PM</Unit>
          </BarSegment>
        </>
      }
    />
  ),
};
